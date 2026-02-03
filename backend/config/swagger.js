const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ultimate Frisbee Manager API',
      version: '2.0.0',
      description: 'API REST pour la gestion d\'exercices, entraînements et échauffements d\'ultimate frisbee',
      contact: {
        name: 'Support API',
        email: 'api@ultimate-frisbee-manager.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Développement local'
      },
      {
        url: 'https://ultimate-frisbee-manager.vercel.app/api',
        description: 'Production (Vercel)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenu via /api/auth/login'
        }
      },
      parameters: {
        workspaceId: {
          in: 'header',
          name: 'X-Workspace-Id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'ID du workspace actif (requis pour routes protégées)'
        }
      },
      responses: {
        Unauthorized: {
          description: 'Non authentifié - Token JWT manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Non autorisé'
                  }
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Accès refusé - Workspace invalide ou permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Accès refusé'
                  }
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Ressource non trouvée'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Erreur de validation - Données invalides',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Validation échouée'
                  },
                  details: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string' },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        RateLimitExceeded: {
          description: 'Limite de requêtes dépassée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Trop de requêtes, réessayez plus tard'
                  },
                  code: {
                    type: 'string',
                    example: 'TOO_MANY_REQUESTS_READ'
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Erreur serveur interne',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Erreur serveur'
                  }
                }
              }
            }
          }
        }
      },
      schemas: {
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique du tag'
            },
            nom: {
              type: 'string',
              description: 'Nom du tag'
            },
            categorie: {
              type: 'string',
              enum: ['objectif', 'travail_specifique', 'niveau', 'materiel', 'type_exercice'],
              description: 'Catégorie du tag'
            },
            workspaceId: {
              type: 'string',
              format: 'uuid',
              description: 'ID du workspace propriétaire'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Exercise: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nom: {
              type: 'string',
              description: 'Nom de l\'exercice'
            },
            description: {
              type: 'string',
              description: 'Description détaillée'
            },
            duree: {
              type: 'integer',
              description: 'Durée en minutes'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'URL de l\'image (Cloudinary)'
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              }
            },
            workspaceId: {
              type: 'string',
              format: 'uuid'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Training: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nom: {
              type: 'string',
              description: 'Nom de l\'entraînement'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Date de l\'entraînement'
            },
            duree_totale: {
              type: 'integer',
              description: 'Durée totale en minutes'
            },
            objectifs: {
              type: 'string',
              nullable: true,
              description: 'Objectifs de la séance'
            },
            echauffement: {
              type: 'object',
              nullable: true,
              description: 'Échauffement associé'
            },
            situationMatch: {
              type: 'object',
              nullable: true,
              description: 'Situation de match associée'
            },
            exercices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exercice: {
                    $ref: '#/components/schemas/Exercise'
                  },
                  ordre: {
                    type: 'integer'
                  },
                  duree: {
                    type: 'integer'
                  }
                }
              }
            },
            tags: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Tag'
              }
            },
            workspaceId: {
              type: 'string',
              format: 'uuid'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Workspace: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            nom: {
              type: 'string',
              description: 'Nom du workspace'
            },
            description: {
              type: 'string',
              nullable: true
            },
            type: {
              type: 'string',
              enum: ['BASE', 'TEST', 'CUSTOM'],
              description: 'Type de workspace'
            },
            isActive: {
              type: 'boolean',
              description: 'Workspace actif ou non'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            email: {
              type: 'string',
              format: 'email'
            },
            nom: {
              type: 'string',
              nullable: true
            },
            prenom: {
              type: 'string',
              nullable: true
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              default: 'USER'
            },
            isActive: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentification et gestion de session'
      },
      {
        name: 'Exercises',
        description: 'Gestion des exercices d\'ultimate frisbee'
      },
      {
        name: 'Trainings',
        description: 'Gestion des entraînements complets'
      },
      {
        name: 'Workspaces',
        description: 'Gestion des espaces de travail (multi-tenant)'
      },
      {
        name: 'Tags',
        description: 'Gestion des tags de catégorisation'
      }
    ]
  },
  apis: [
    './routes/auth.routes.js',
    './routes/exercice.routes.js',
    './routes/entrainement.routes.js',
    './routes/workspace.routes.js',
    './routes/tag.routes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
