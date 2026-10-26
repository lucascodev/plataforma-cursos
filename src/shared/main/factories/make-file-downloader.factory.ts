import type { FileDownloader } from '@/shared/application/ports/file-downloader.interface';
import { BrowserFileDownloader } from '@/shared/infra/file/browser-file-downloader';

export function makeFileDownloader(): FileDownloader {
  return new BrowserFileDownloader();
}
