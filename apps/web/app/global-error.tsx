'use client';

import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error }: { error: Error }) {
  Sentry.captureException(error);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
      </body>
    </html>
  );
}