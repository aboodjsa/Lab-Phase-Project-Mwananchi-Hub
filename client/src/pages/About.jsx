export default function About() {
  const v = [["Trust first", "Every provider shows a real photo, experience and verified customer reviews."], ["Fair and clear", "Rates are visible before you book. No hidden surprises."], ["Community-driven", "We help local skilled workers find steady customers, and neighbours find reliable help."]];
  return (<div>
    <h1>About Service Mwananchi Hub</h1>
    <p className="lead">"Mwananchi" means citizen in Swahili. We built this platform so that everyday people can find dependable local help, and skilled professionals can be found for the quality of their work.</p>
    <h2>The problem we solve</h2>
    <p>Finding a reliable plumber, electrician or cleaner usually means asking around and hoping. Customers cannot tell who is available or experienced, and providers depend on word of mouth. Service Mwananchi Hub puts both sides in one place.</p>
    <h2>Our values</h2>
    <div className="grid">{v.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
    <h2>How the platform works</h2>
    <p>Customers search and filter providers, send a booking request, and track its status. Providers accept, complete and get reviewed. Administrators oversee users, categories and bookings to keep the community safe.</p>
  </div>);
}
