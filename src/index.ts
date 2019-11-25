import * as Theory from './theory';
import * as Methods from './methods';

export * from './types';
export * from './properties';

export const NOTE = {
  ...Theory,
  ...Methods,
};
