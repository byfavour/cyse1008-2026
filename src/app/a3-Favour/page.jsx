"use client";

import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import { RouterLink } from "src/routes/components";

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Assignment 3: My New Page</h1>

      <p>
        <strong>URL:</strong> /a3-Favour
      </p>

      <p>
        <strong>File:</strong> src/app/a3-Favour/page.jsx
      </p>

      <Link component={RouterLink} href="/">
        Back to Home
      </Link>

      <Button variant="contained" color="primary" style={{ marginLeft: 16 }}>
        Click Me
      </Button>
    </main>
  );
}