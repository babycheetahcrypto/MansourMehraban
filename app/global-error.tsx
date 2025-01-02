'use client';

import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '20px', backgroundColor: 'black', color: 'white' }}>
          <h1>Oops! Something went wrong</h1>
          <p>{error.message}</p>
          <NextError statusCode={500} />
        </div>
      </body>
    </html>
  );
}