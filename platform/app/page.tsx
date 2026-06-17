export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Tafheem Platform — API shell</h1>
      <p>This app hosts the Tafheem Phase 1 backend (Next.js Route Handlers + Supabase).</p>
      <p>The UI here is intentionally undesigned. Backend test pages:</p>
      <ul>
        <li><a href="/test/register.html">/test/register.html</a></li>
        <li><a href="/test/login.html">/test/login.html</a></li>
        <li><a href="/test/reader.html">/test/reader.html</a></li>
        <li><a href="/test/write.html">/test/write.html</a></li>
        <li><a href="/test/feed.html">/test/feed.html</a></li>
        <li><a href="/test/dashboard.html">/test/dashboard.html</a></li>
        <li><a href="/test/mod.html">/test/mod.html</a></li>
      </ul>
    </main>
  );
}
