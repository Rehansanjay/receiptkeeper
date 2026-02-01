// Supabase Edge Function for Google Vision API OCR
// Deploy with: supabase functions deploy ocr-google

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Get authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get user's subscription info
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('subscription_tier, ocr_engine, monthly_upload_count, upload_limit')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            return new Response(
                JSON.stringify({ error: 'Profile not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Verify user has access to OCR.space (Pro or Premium tier)
        if (profile.ocr_engine !== 'ocrspace') {
            return new Response(
                JSON.stringify({
                    error: 'Upgrade required',
                    message: 'Premium OCR is only available for Pro and Premium users',
                    current_tier: profile.subscription_tier
                }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check upload limit
        if (profile.monthly_upload_count >= profile.upload_limit) {
            return new Response(
                JSON.stringify({
                    error: 'Upload limit reached',
                    message: `You've used all ${profile.upload_limit} uploads this month`,
                    current_count: profile.monthly_upload_count,
                    limit: profile.upload_limit
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse multipart form data to get image
        const formData = await req.formData()
        const imageFile = formData.get('image') as File

        if (!imageFile) {
            return new Response(
                JSON.stringify({ error: 'No image provided' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Convert image to base64
        const imageBuffer = await imageFile.arrayBuffer()
        const base64Image = btoa(
            new Uint8Array(imageBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            )
        )

        // Call OCR.space API
        const ocrApiKey = Deno.env.get('OCR_SPACE_API_KEY')
        if (!ocrApiKey) {
            return new Response(
                JSON.stringify({ error: 'OCR.space API key not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Prepare form data for OCR.space
        const ocrFormData = new FormData()
        ocrFormData.append('base64Image', `data:${imageFile.type};base64,${base64Image}`)
        ocrFormData.append('language', 'eng')
        ocrFormData.append('isOverlayRequired', 'false')
        ocrFormData.append('detectOrientation', 'true')
        ocrFormData.append('scale', 'true')
        ocrFormData.append('OCREngine', '2') // Engine 2 is better for receipts

        const ocrResponse = await fetch(
            'https://api.ocr.space/parse/image',
            {
                method: 'POST',
                headers: {
                    'apikey': ocrApiKey,
                },
                body: ocrFormData
            }
        )

        const ocrData = await ocrResponse.json()

        if (!ocrResponse.ok || ocrData.IsErroredOnProcessing) {
            console.error('OCR.space API error:', ocrData)
            return new Response(
                JSON.stringify({
                    error: 'OCR API error',
                    details: ocrData.ErrorMessage || ocrData.ParsedResults?.[0]?.ErrorMessage || 'Unknown error'
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Extract text from OCR.space response
        const fullText = ocrData.ParsedResults?.[0]?.ParsedText || ''

        if (!fullText) {
            return new Response(
                JSON.stringify({
                    error: 'No text detected',
                    message: 'Could not extract text from image. Please ensure the image is clear and contains a receipt.'
                }),
                { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parse receipt data using smart extraction
        const extractedData = parseReceiptText(fullText)

        // Increment upload count
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
                monthly_upload_count: profile.monthly_upload_count + 1
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Failed to increment upload count:', updateError)
        }

        // Return extracted data
        return new Response(
            JSON.stringify({
                success: true,
                data: extractedData,
                raw_text: fullText,
                usage: {
                    count: profile.monthly_upload_count + 1,
                    limit: profile.upload_limit,
                    remaining: profile.upload_limit - (profile.monthly_upload_count + 1)
                }
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

// Helper function to parse receipt text and extract key data
function parseReceiptText(text: string): {
    merchant: string
    amount: string
    date: string
    confidence: {
        merchant: number
        amount: number
        date: number
    }
} {
    const lines = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

    // Extract merchant (usually first substantial line)
    let merchant = ''
    let merchantConfidence = 0.5
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i]
        // Look for line with mostly letters, not too short
        if (line.length >= 3 && /[a-zA-Z]/.test(line)) {
            const letterCount = (line.match(/[a-zA-Z]/g) || []).length
            if (letterCount / line.length > 0.5) {
                merchant = line
                merchantConfidence = 0.9
                break
            }
        }
    }

    // Extract total amount (look for "total" keyword first, then largest amount)
    let amount = ''
    let amountConfidence = 0.5

    // Strategy 1: Find "total" keyword
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].toLowerCase()
        if (line.includes('total')) {
            const match = lines[i].match(/\$?\s*(\d+\.\d{2})/)
            if (match) {
                amount = match[1]
                amountConfidence = 0.95
                break
            }
        }
    }

    // Strategy 2: Fallback to largest amount
    if (!amount) {
        let maxAmount = 0
        for (const line of lines) {
            const matches = line.match(/\$?\s*(\d+\.\d{2})/g)
            if (matches) {
                for (const match of matches) {
                    const value = parseFloat(match.replace(/[$\s]/g, ''))
                    if (value > maxAmount) {
                        maxAmount = value
                        amount = value.toFixed(2)
                        amountConfidence = 0.7
                    }
                }
            }
        }
    }

    // Extract date (look for MM/DD/YYYY or similar patterns)
    let date = ''
    let dateConfidence = 0.5

    const datePatterns = [
        /(\d{1,2}\/\d{1,2}\/\d{4})/,  // MM/DD/YYYY
        /(\d{1,2}-\d{1,2}-\d{4})/,    // MM-DD-YYYY
        /(\d{4}-\d{1,2}-\d{1,2})/,    // YYYY-MM-DD
    ]

    for (const line of lines) {
        for (const pattern of datePatterns) {
            const match = line.match(pattern)
            if (match) {
                date = match[1]
                // Validate it's not a future date
                const parsedDate = new Date(date)
                if (parsedDate <= new Date()) {
                    dateConfidence = 0.9
                    break
                }
            }
        }
        if (date) break
    }

    return {
        merchant: merchant || 'Unknown',
        amount: amount || '0.00',
        date: date || new Date().toISOString().split('T')[0],
        confidence: {
            merchant: merchantConfidence,
            amount: amountConfidence,
            date: dateConfidence,
        },
    }
}
