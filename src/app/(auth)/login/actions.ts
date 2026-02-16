'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '../../../db/serverClient'

export async function login(formData: FormData) {
    const supabase = await createSupabaseServerClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        console.error(error.message)
        redirect('/login?error=invalid_credentials')
    }

    revalidatePath('/', 'layout')
    redirect('/')
    }

    export async function signup(formData: FormData) {
    const supabase = await createSupabaseServerClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
        console.error(error.message)
        redirect('/signup?error=signup_failed')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
