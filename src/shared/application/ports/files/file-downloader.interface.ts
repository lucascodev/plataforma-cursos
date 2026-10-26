import type { DownloadableFile } from './downloadable-file.type';

export interface FileDownloader {
  download(file: DownloadableFile): void;
}
