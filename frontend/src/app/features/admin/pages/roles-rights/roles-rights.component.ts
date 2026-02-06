import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

type WorkspaceRole = 'MANAGER' | 'MEMBER' | 'VIEWER';

type PermissionKey =
  | 'read'
  | 'create'
  | 'edit'
  | 'delete'
  | 'manage_members'
  | 'manage_settings'
  | 'export'
  | 'base_write';

interface RoleDefinitionRow {
  scope: 'Plateforme' | 'Workspace';
  role: string;
  label: string;
  summary: string;
}

interface PermissionMatrixRow {
  permission: string;
  key: PermissionKey;
  viewer: boolean;
  member: boolean;
  manager: boolean;
  note?: string;
}

@Component({
  selector: 'app-roles-rights',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTableModule, MatChipsModule],
  template: `
    <div class="container">
      <h1><mat-icon>security</mat-icon> Rôles & droits</h1>

      <mat-card class="section">
        <h2>Rôles plateforme</h2>
        <table mat-table [dataSource]="platformRoles" class="mat-elevation-z0">
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [style.background-color]="row.role === 'ADMIN' ? '#f59e0b' : '#3b82f6'" [style.color]="'#111827'">
                {{ row.role }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="label">
            <th mat-header-cell *matHeaderCellDef>Libellé</th>
            <td mat-cell *matCellDef="let row">{{ row.label }}</td>
          </ng-container>

          <ng-container matColumnDef="summary">
            <th mat-header-cell *matHeaderCellDef>Signification</th>
            <td mat-cell *matCellDef="let row">{{ row.summary }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="roleColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: roleColumns"></tr>
        </table>
      </mat-card>

      <mat-card class="section">
        <h2>Rôles workspace</h2>
        <table mat-table [dataSource]="workspaceRoles" class="mat-elevation-z0">
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rôle</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [style.background-color]="getWorkspaceRoleColor(row.role)" [style.color]="'#111827'">
                {{ row.role }}
              </mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="label">
            <th mat-header-cell *matHeaderCellDef>Libellé</th>
            <td mat-cell *matCellDef="let row">{{ row.label }}</td>
          </ng-container>

          <ng-container matColumnDef="summary">
            <th mat-header-cell *matHeaderCellDef>Signification</th>
            <td mat-cell *matCellDef="let row">{{ row.summary }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="roleColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: roleColumns"></tr>
        </table>
      </mat-card>

      <mat-card class="section">
        <h2>Matrice des permissions (workspace)</h2>
        <table mat-table [dataSource]="workspacePermissions" class="mat-elevation-z0">
          <ng-container matColumnDef="permission">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let row">
              <div class="perm-name">{{ row.permission }}</div>
              <div class="perm-note" *ngIf="row.note">{{ row.note }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="viewer">
            <th mat-header-cell *matHeaderCellDef>VIEWER</th>
            <td mat-cell *matCellDef="let row">{{ row.viewer ? 'Oui' : 'Non' }}</td>
          </ng-container>

          <ng-container matColumnDef="member">
            <th mat-header-cell *matHeaderCellDef>MEMBER</th>
            <td mat-cell *matCellDef="let row">{{ row.member ? 'Oui' : 'Non' }}</td>
          </ng-container>

          <ng-container matColumnDef="manager">
            <th mat-header-cell *matHeaderCellDef>MANAGER</th>
            <td mat-cell *matCellDef="let row">{{ row.manager ? 'Oui' : 'Non' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="permColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: permColumns"></tr>
        </table>

        <div class="footnotes">
          <div><strong>BASE :</strong> sur le workspace BASE, toute écriture (create/edit/delete) est refusée aux non-admin.</div>
          <div><strong>Export :</strong> réservé au rôle plateforme ADMIN.</div>
        </div>
      </mat-card>

      <mat-card class="section">
        <h2>Où gérer quoi ? (dans l'app)</h2>
        <div class="where-grid">
          <div class="where-item">
            <div class="where-title">Rôle plateforme (ADMIN/USER)</div>
            <div class="where-text">Admin → Utilisateurs → éditer un utilisateur → champ "Rôle".</div>
          </div>
          <div class="where-item">
            <div class="where-title">Rôles workspace (MANAGER/MEMBER/VIEWER)</div>
            <div class="where-text">Admin → Workspaces → ouvrir un workspace → "Gérer les membres" (dialog).</div>
          </div>
          <div class="where-item">
            <div class="where-title">Restrictions BASE</div>
            <div class="where-text">Appliquées par le front (guards) + back (protections BASE). En pratique : seules les actions ADMIN sont autorisées sur BASE.</div>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container { max-width: 1200px; margin: 0 auto; }
      h1 { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .section { margin-bottom: 16px; padding: 16px; }
      h2 { margin: 0 0 12px 0; font-size: 18px; color: #475569; }
      table { width: 100%; }
      .perm-name { font-weight: 600; }
      .perm-note { font-size: 12px; color: #64748b; margin-top: 2px; }
      .footnotes { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; color: #334155; font-size: 13px; }
      .where-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; }
      .where-item { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
      .where-title { font-weight: 600; color: #0f172a; margin-bottom: 4px; }
      .where-text { color: #334155; font-size: 13px; }
    `,
  ],
})
export class RolesRightsComponent {
  roleColumns: Array<keyof RoleDefinitionRow> = ['role', 'label', 'summary'];
  permColumns = ['permission', 'viewer', 'member', 'manager'];

  platformRoles: RoleDefinitionRow[] = [
    {
      scope: 'Plateforme',
      role: 'ADMIN',
      label: 'Administrateur',
      summary: "Accès à l'espace /admin, gestion des utilisateurs et des workspaces, export global."
    },
    {
      scope: 'Plateforme',
      role: 'USER',
      label: 'Utilisateur',
      summary: "Accès standard à l'application (pas d'accès /admin)."
    },
  ];

  workspaceRoles: RoleDefinitionRow[] = [
    {
      scope: 'Workspace',
      role: 'VIEWER',
      label: 'Lecteur',
      summary: "Lecture seule dans le workspace."
    },
    {
      scope: 'Workspace',
      role: 'MEMBER',
      label: 'Membre',
      summary: "Peut créer/modifier/supprimer du contenu dans le workspace (hors BASE)."
    },
    {
      scope: 'Workspace',
      role: 'MANAGER',
      label: 'Gestionnaire',
      summary: "Peut gérer les membres du workspace et ses réglages, en plus des droits MEMBER (hors BASE)."
    },
  ];

  workspacePermissions: PermissionMatrixRow[] = [
    { permission: 'Lire le contenu', key: 'read', viewer: true, member: true, manager: true },
    { permission: 'Créer du contenu', key: 'create', viewer: false, member: true, manager: true },
    { permission: 'Modifier du contenu', key: 'edit', viewer: false, member: true, manager: true },
    { permission: 'Supprimer du contenu', key: 'delete', viewer: false, member: true, manager: true },
    { permission: 'Gérer les membres du workspace', key: 'manage_members', viewer: false, member: false, manager: true },
    { permission: 'Gérer les paramètres du workspace', key: 'manage_settings', viewer: false, member: false, manager: true },
    {
      permission: 'Exporter (Import/Export)',
      key: 'export',
      viewer: false,
      member: false,
      manager: false,
      note: 'Réservé aux ADMIN plateforme.'
    },
    {
      permission: 'Écrire sur le workspace BASE',
      key: 'base_write',
      viewer: false,
      member: false,
      manager: false,
      note: 'Sur BASE, seules les actions ADMIN sont autorisées.'
    },
  ];

  getWorkspaceRoleColor(role: string): string {
    const r = String(role || '').trim().toUpperCase() as WorkspaceRole;
    if (r === 'MANAGER') return '#a855f7';
    if (r === 'MEMBER') return '#3b82f6';
    return '#94a3b8';
  }
}
