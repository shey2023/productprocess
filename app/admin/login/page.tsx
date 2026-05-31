export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        action="/api/admin/login"
        method="POST"
        className="panel w-full max-w-sm space-y-6 p-10"
      >
        <div className="text-center">
          <p className="eyebrow mb-3">כניסה מאובטחת</p>
          <h1 className="text-2xl font-normal text-ink">דף המנהל</h1>
        </div>
        <input
          type="password"
          name="passcode"
          autoFocus
          required
          placeholder="סיסמת כניסה"
          className="field text-center"
        />
        {error && (
          <p className="text-center text-sm text-gold-deep">סיסמה שגויה</p>
        )}
        <button type="submit" className="btn-primary w-full">
          כניסה
        </button>
      </form>
    </main>
  );
}
