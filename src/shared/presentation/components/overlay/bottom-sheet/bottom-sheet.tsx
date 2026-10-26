import { Dialog } from '../dialog/dialog';
import type { DialogProps } from '../dialog/dialog-props.type';

export function BottomSheet(props: DialogProps) {
  return <Dialog {...props} placement="sheet" />;
}
