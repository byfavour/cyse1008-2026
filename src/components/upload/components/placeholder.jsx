// src/components/upload/components/placeholder.jsx

import { Typography, Box } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export function UploadPlaceholder({ icon = 'eva:cloud-upload-fill', label = 'Upload file' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <Iconify icon={icon} width={40} height={40} sx={{ color: 'text.secondary', mb: 1 }} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
