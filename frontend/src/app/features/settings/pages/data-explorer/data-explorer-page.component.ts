import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ContentListComponent } from '../../components/content-list/content-list.component';
import { TagListComponent } from '../../components/tag-list/tag-list.component';


@Component({
  selector: 'app-data-explorer-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    ContentListComponent,
    TagListComponent
  ],
  templateUrl: './data-explorer-page.component.html',
  styleUrls: ['./data-explorer-page.component.scss']
})
export class DataExplorerPageComponent {}
