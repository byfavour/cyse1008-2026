"use client";

import Link from "@mui/material/Link";
import { RouterLink } from "src/routes/components";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Assignment 3: My New Page</h1>

      <p>
        <strong>URL:</strong> /a3-yourname
      </p>

      <p>
        <strong>File:</strong> src/app/a3-yourname/page.jsx
      </p>

      <Link component={RouterLink} href="/">
        Back to Home
      </Link>
    </main>
  );
}
