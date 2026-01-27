import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useMemo } from 'react';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function SingleFilePreview({ file, sx, className, ...other }) {
  const fileName = typeof file === 'string' ? file : file.name;

  const previewUrl = useMemo(() => {
    if (typeof file === 'string') {
      return file;
    }

    if (file instanceof File || file instanceof Blob) {
      return URL.createObjectURL(file);
    }

    console.warn('❌ Invalid file passed to SingleFilePreview:', file);
    return null;
  }, [file]);

  return (
    <Box
      className={uploadClasses.uploadSinglePreview.concat(className ? ` ${className}` : '')}
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
        ...sx,
      }}
      {...other}
    >
      <Box>
        {previewUrl ? (
          <Box
            component="img"
            alt={fileName}
            src={previewUrl}
            sx={{
              width: 1,
              height: 1,
              borderRadius: 1,
              objectFit: 'cover',
            }}
          />
        ) : (
          <Typography color="error">Invalid file</Typography>
        )}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function DeleteButton({ sx, ...other }) {
  return (
    <IconButton
      size="small"
      sx={{
        top: 16,
        right: 16,
        zIndex: 9,
        position: 'absolute',
        color: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
        '&:hover': {
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
        },
        ...sx,
      }}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}
