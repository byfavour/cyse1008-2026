import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const metadata = { title: `Encryption - ${CONFIG.appName}` };

export function OverviewEncryptionView() {
  return (
    <Container>
      <Typography variant="h4">Encryption</Typography>
    </Container>
  );
}
