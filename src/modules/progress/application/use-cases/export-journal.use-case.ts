import type { FileDownloader } from '@/shared/application/ports/files/file-downloader.interface';
import { buildJournalMarkdown } from '../../domain/rules/build-journal-markdown.rule';
import type { ExportJournalInputDto } from '../dtos/export-journal/export-journal-input.dto';

export class ExportJournalUseCase {
  constructor(private readonly fileDownloader: FileDownloader) {}

  execute(input: ExportJournalInputDto): void {
    this.fileDownloader.download({
      filename: `diario-${input.courseSlug}-${input.journalExport.exportedOn}.md`,
      content: buildJournalMarkdown(input.progress, input.journalExport),
      mimeType: 'text/markdown;charset=utf-8',
    });
  }
}
