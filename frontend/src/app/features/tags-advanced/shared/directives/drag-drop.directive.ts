import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';

/**
 * Directive pour le drag & drop de fichiers
 * Permet de faciliter l'upload de fichiers par glisser-déposer
 */
@Directive({
  selector: '[appDragDrop]'
})
export class DragDropDirective {
  @HostBinding('class.dragging') private dragging: boolean = false;
  
  @Output() fileDropped = new EventEmitter<any>();
  
  /**
   * Événement déclenché lors du survol d'un élément avec un fichier
   * @param event Événement de survol (dragover)
   */
  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }
  
  /**
   * Événement déclenché lorsque le fichier quitte la zone
   * @param event Événement de sortie (dragleave)
   */
  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }
  
  /**
   * Événement déclenché lors du dépôt d'un fichier
   * @param event Événement de dépôt (drop)
   */
  @HostListener('drop', ['$event']) onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileDropped.emit({
        target: {
          files
        }
      });
    }
  }
}
