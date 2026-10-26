import type { DownloadableFile } from '@/shared/application/ports/downloadable-file.type';
import type { FileDownloader } from '@/shared/application/ports/file-downloader.interface';

export class BrowserFileDownloader implements FileDownloader {
  download(file: DownloadableFile): void {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}
