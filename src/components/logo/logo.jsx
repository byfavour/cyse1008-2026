'use client';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

const IMAGE_SRC = '/logo/brm-logo.png';

export const Logo = forwardRef(
  (
    { width, href = '/', height, isSingle = true, disableLink = false, className, sx, ...other },
    ref
  ) => {
    const defaultWidth = width || 120;
    const defaultHeight = height || 36;

    const image = (
      <Box
        alt="Black River Market"
        component="img"
        src={IMAGE_SRC}
        width="100%"
        height="100%"
        sx={{ objectFit: 'contain' }}
      />
    );

    const logo = isSingle ? image : image;

    if (disableLink) {
      return (
        <Box
          ref={ref}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          sx={{ width: defaultWidth, height: defaultHeight, cursor: 'default', display: 'inline-flex', ...sx }}
          {...other}
        >
          {logo}
        </Box>
      );
    }

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        sx={{ width: defaultWidth, height: defaultHeight, cursor: 'pointer', display: 'inline-flex', ...sx }}
        {...other}
      >
        {logo}
      </Box>
    );
  }
);
