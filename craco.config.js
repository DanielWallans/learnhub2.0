const path = require('path');

// Único ajuste no CRA: o alias "@" aponta para src/ (ex.: import { cn } from '@/lib/utils')
module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
