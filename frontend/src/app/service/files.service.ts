import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  private uploadedFiles: { [index: number]: File[] } = {};

  setFiles(index: number, files: File[]): void {
    this.uploadedFiles[index] = files;
  }

  getFiles(index: number): File[] {
    return this.uploadedFiles[index] || [];
  }

  getAllFiles(): { [index: number]: File[] } {
    return this.uploadedFiles;
  }
}
