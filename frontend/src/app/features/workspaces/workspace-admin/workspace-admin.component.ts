import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorkspaceService, WorkspaceSummary } from '../../../core/services/workspace.service';
import { environment } from '../../../../environments/environment';

interface WorkspaceMemberDto {
  userId: string;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  role: string;
  linkId: string;
}

interface WorkspaceMembersResponse {
  workspaceId: string;
  name: string;
  users: WorkspaceMemberDto[];
}

@Component({
  standalone: true,
  selector: 'app-workspace-admin',
  templateUrl: './workspace-admin.component.html',
  styleUrls: ['./workspace-admin.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
})
export class WorkspaceAdminComponent implements OnInit {
  workspace: WorkspaceSummary | null = null;
  members: WorkspaceMemberDto[] = [];

  displayedColumns: string[] = ['email', 'nom', 'role', 'actions'];

  loading = false;
  saving = false;

  settingsForm: FormGroup;
  newMemberForm: FormGroup;

  constructor(
    private http: HttpClient,
    private workspaceService: WorkspaceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.settingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.newMemberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.workspace = this.workspaceService.getCurrentWorkspace();
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    const url = `${environment.apiUrl}/workspaces/members`;

    this.http.get<WorkspaceMembersResponse>(url).subscribe({
      next: (res) => {
        this.loading = false;
        this.members = res.users || [];

        if (this.settingsForm && res.name) {
          this.settingsForm.patchValue({ name: res.name });
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Impossible de charger les membres du workspace.', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.saving = true;
    const url = `${environment.apiUrl}/workspaces/settings`;

    this.http.put(url, this.settingsForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Workspace mis à jour.', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise à jour du workspace.', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  addMember(): void {
    if (this.newMemberForm.invalid) {
      return;
    }

    const { email, role } = this.newMemberForm.value;

    const lowerEmail = String(email).trim().toLowerCase();

    // Ajoute un membre "virtuel" le temps de l'enregistrement global
    this.members = [
      ...this.members,
      {
        userId: lowerEmail,
        email: lowerEmail,
        nom: '',
        prenom: '',
        role: String(role).toUpperCase(),
        linkId: '',
      },
    ];

    this.newMemberForm.reset({ role: 'USER' });
    this.saveMembers();
  }

  removeMember(member: WorkspaceMemberDto): void {
    this.members = this.members.filter((m) => m !== member);
    this.saveMembers();
  }

  changeRole(member: WorkspaceMemberDto, role: string): void {
    member.role = role.toUpperCase();
    this.saveMembers();
  }

  private saveMembers(): void {
    const url = `${environment.apiUrl}/workspaces/members`;

    const payload = {
      users: this.members.map((m) => ({
        userId: m.userId,
        role: m.role,
      })),
    };

    this.saving = true;
    this.http.put(url, payload).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Membres du workspace mis à jour.', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.loadMembers();
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Erreur lors de la mise à jour des membres.', 'Fermer', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
