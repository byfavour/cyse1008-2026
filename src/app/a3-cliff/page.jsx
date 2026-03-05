"use client";

import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { RouterLink } from "src/routes/components";

export default function Page() {
  const foo = {
    bar: "blah",
    key: 123,
  };
  const foobar = () => console.log({ foo });

  return (
    <main style={{ padding: 24 }}>
      <h1>Assignment 3: My New Page</h1>
      <button>hello</button>
      <p>
        <strong>URL:</strong> /a3-yourname
      </p>

      <p>
        <strong>File:</strong> src/app/a3-cliff/page.jsx
      </p>

      <Link component={RouterLink} href="/">
        Back to Home
      </Link>
      <br />
      <Button variant="contained" sx={{ mt: 2 }} onClick={foobar}>
        Continue shopping
      </Button>
    </main>
  );
}
