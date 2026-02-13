export default function Layout({ children }) {
  return (
    <div style={{ border: '2px solid blue', padding: 16, margin: 16 }}>
      <header style={{ marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid gray' }}>
        <h2>My Custom Layout Header</h2>
      </header>
      
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 200 }}>
        {children}
      </main>
      
      <footer style={{ marginTop: 16, paddingTop: 8, borderTop: '1px solid gray', fontSize: 12, textAlign: 'center' }}>
        <p>Layout Footer - Assignment 3</p>
      </footer>
    </div>
  );
}