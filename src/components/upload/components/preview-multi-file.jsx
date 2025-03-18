import Image from 'next/image';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';
import { fileData, FileThumbnail } from '../../file-thumbnail';

// ----------------------------------------------------------------------
export function MultiFilePreview({
  sx,
  onRemove,
  lastNode,
  thumbnail,
  slotProps,
  firstNode,
  files = [],
  className,
  ...other
}) {
  const renderFirstNode = firstNode && (
    <Box
      component="li"
      sx={{
        ...(thumbnail && {
          width: 'auto',
          display: 'inline-flex',
        }),
      }}
    >
      {firstNode}
    </Box>
  );

  const renderLastNode = lastNode && (
    <Box
      component="li"
      sx={{
        ...(thumbnail && { width: 'auto', display: 'inline-flex' }),
      }}
    >
      {lastNode}
    </Box>
  );

  return (
    <Box
      component="ul"
      className={uploadClasses.uploadMultiPreview.concat(className ? ` ${className}` : '')}
      sx={{
        gap: 1,
        display: 'flex',
        flexDirection: 'column',
        ...(thumbnail && {
          flexWrap: 'wrap',
          flexDirection: 'row',
        }),
        ...sx,
      }}
      {...other}
    >
      {renderFirstNode}

      {files.map((file, index) => {
        // If it's a URL (uploaded file)
        if (typeof file === 'string') {
          return (
            <Box component="li" key={`${file}-${index}`} sx={{ display: 'inline-flex' }}>
              <Image
                src={file}
                alt={`Uploaded file ${index}`}
                width={80}
                height={80}
                sx={{ objectFit: 'cover', borderRadius: 4 }}
              />
              {onRemove && (
                <IconButton size="small" onClick={() => onRemove(file)}>
                  <Iconify icon="mingcute:close-line" width={16} />
                </IconButton>
              )}
            </Box>
          );
        }

        // If it's a File object (local file selected but not yet uploaded)
        const { name } = fileData(file);
        return (
          <Box component="li" key={`${name}-${index}`} sx={{ display: 'inline-flex' }}>
            <FileThumbnail
              tooltip
              imageView
              file={file}
              onRemove={() => onRemove?.(file)}
              sx={{
                width: 80,
                height: 80,
                border: (theme) =>
                  `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
              }}
              slotProps={{ icon: { width: 36, height: 36 } }}
              {...slotProps?.thumbnail}
            />
          </Box>
        );
      })}

      {renderLastNode}
    </Box>
  );
}
