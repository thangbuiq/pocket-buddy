export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-medium">Profile</h2>
          <p className="mt-1 text-sm text-slate-400">Name, avatar, email, and timezone preferences.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-medium">Currency</h2>
          <p className="mt-1 text-sm text-slate-400">Default currency: USD (switch to EUR, VND, GBP, JPY).</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-medium">Categories</h2>
          <p className="mt-1 text-sm text-slate-400">Add, rename, or delete your custom categories.</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="font-medium">Data</h2>
          <p className="mt-1 text-sm text-slate-400">Export CSV and delete account controls.</p>
        </article>
      </section>
    </div>
  );
}
