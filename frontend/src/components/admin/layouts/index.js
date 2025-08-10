import DefaultLayout from './DefaultLayout';
import MaterialLayout from './MaterialLayout';
import CoreUILayout from './CoreUILayout';
import MinimalLayout from './MinimalLayout';

export const layoutMap = {
  default: DefaultLayout,
  material: MaterialLayout,
  coreui: CoreUILayout,
  minimal: MinimalLayout,
};

export function getLayoutByKey(key) {
  return layoutMap[key] || DefaultLayout;
} 