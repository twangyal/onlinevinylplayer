import { login, signup } from './actions'

export default function LoginPage() {
    return (
        <div style={{ maxWidth: 400, margin: '4rem auto' }}>
        <h1>Sign in / Sign up</h1>
        <form>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />

            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button formAction={login}>Log in</button>
            <button formAction={signup}>Sign up</button>
            </div>
        </form>
        </div>
    )
}
