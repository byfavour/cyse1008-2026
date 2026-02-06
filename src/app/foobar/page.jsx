import Link from "@mui/material/Link";
import { RouterLink } from "src/routes/components";
export const metadata = { title: "Assignment 3: App Router" };
console.log("A3 PAGE LOADED", window.location);
export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Assignment 3: My New Page</h1>
      <p>
        <strong>URL:</strong> /a3-yourname
      </p>{" "}
      <p>
        <strong>File:</strong> src/app/a3-yourname/page.jsx
      </p>{" "}
      <p>
        This page exists because the folder name becomes part of the URL in the
        App Router.
      </p>{" "}
      <hr />{" "}
      <Link component={RouterLink} href="/">
        {" "}
        Back to Home{" "}
      </Link>{" "}
    </main>
  );
}
