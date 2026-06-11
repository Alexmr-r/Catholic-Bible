# 🛠️ CatholicVerse Backoffice — Panel de Administración

Panel interno de administración de CatholicVerse. **React 19 + TypeScript + Vite** (Vanilla CSS), desplegado en Cloudflare Pages: `https://catholic-verse-admin.pages.dev`.

## Páginas

| Página | Función | Endpoints que consume |
|---|---|---|
| Login | Acceso al panel (credenciales en el cliente — ver deuda técnica) | — |
| Dashboard | Métricas y distribución de usuarios | `GET /admin/dashboard-stats` |
| Users | CRM: listar, cambiar plan Premium/Free, borrado GDPR | `GET/PUT/DELETE /admin/users…` |
| Content | CMS de lecturas litúrgicas + corrección de erratas de versículos | `/admin/daily-readings`, `PUT /admin/bible/verses` |
| Logs | Registro de actividad | `GET /admin/audit-logs` |
| Settings | URL del backend configurable (localStorage `springBootUrl`) | — |

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción (dist/)
```

## 📚 Documentación

- **Documentación completa del backoffice:** [`../docs/04-backoffice-y-web/BACKOFFICE_ADMIN_DOCUMENTACION.md`](../docs/04-backoffice-y-web/BACKOFFICE_ADMIN_DOCUMENTACION.md)
- **Contexto del sistema:** [`../docs/01-sistema/DOCUMENTACION_MAESTRA_2026.md`](../docs/01-sistema/DOCUMENTACION_MAESTRA_2026.md) (sección 13)
- ⚠️ Deuda técnica conocida: `/admin/**` es público a nivel de Spring Security y el login del panel es de cliente — ver sección 16 de la Documentación Maestra.
