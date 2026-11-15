#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define AZUL "\033[1;36m"
#define VERDE "\033[1;32m"
#define AMARILLO "\033[1;33m"
#define ROJO "\033[1;31m"
#define NORMAL "\033[0m"

struct Tarea {
    char nombre[50];
    int completada;
    int dia;
    int mes;
    int anio;
    int proyecto;
    struct Tarea *sig;
};

struct Unidad {
    char nombre[50];
    struct Tarea *tareas;
    struct Unidad *sig;
};

struct Materia {
    char nombre[50];
    struct Unidad *unidades;
    struct Materia *sig;
};

struct Pendiente {
    char tarea[50];
    char unidad[50];
    char materia[50];
    struct Pendiente *sig;
};

struct Evento {
    char nombre[50];
    char materia[50];
    int proyecto;
    int completada;
    struct Evento *sig;
};

struct Materia *materias = NULL;
struct Pendiente *frente = NULL;
struct Pendiente *fin = NULL;
struct Pendiente *tope = NULL;
struct Evento *calendario[32];

void leerTexto(char *texto, int tam) {
    fgets(texto, tam, stdin);
    texto[strcspn(texto, "\n")] = '\0';
}

int leerEntero(char *mensaje) {
    char texto[50];
    printf("%s", mensaje);
    leerTexto(texto, 50);
    return atoi(texto);
}

/*  Fechas  */

int diasDelMes(int mes, int anio) {
    int cantidad[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (mes == 2 && ((anio % 4 == 0 && anio % 100 != 0) || anio % 400 == 0)) {
        return 29;
    }
    return cantidad[mes - 1];
}

int fechaValida(int dia, int mes, int anio) {
    if (anio < 2000 || anio > 2100) {
        return 0;
    }
    if (mes < 1 || mes > 12) {
        return 0;
    }
    if (dia < 1 || dia > diasDelMes(mes, anio)) {
        return 0;
    }
    return 1;
}

int diaSemana(int dia, int mes, int anio) {
    int t[12] = {0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4};
    if (mes < 3) {
        anio = anio - 1;
    }
    return (anio + anio / 4 - anio / 100 + anio / 400 + t[mes - 1] + dia) % 7;
}

/*  Lista de materias  */

struct Materia *buscarMateria(char *nombre) {
    struct Materia *aux = materias;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarMateria(char *nombre) {
    struct Materia *nueva = (struct Materia *)malloc(sizeof(struct Materia));
    strcpy(nueva->nombre, nombre);
    nueva->unidades = NULL;
    nueva->sig = NULL;

    if (materias == NULL) {
        materias = nueva;
    } else {
        struct Materia *aux = materias;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Lista de unidades  */

struct Unidad *buscarUnidad(struct Materia *materia, char *nombre) {
    struct Unidad *aux = materia->unidades;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarUnidad(struct Materia *materia, char *nombre) {
    struct Unidad *nueva = (struct Unidad *)malloc(sizeof(struct Unidad));
    strcpy(nueva->nombre, nombre);
    nueva->tareas = NULL;
    nueva->sig = NULL;

    if (materia->unidades == NULL) {
        materia->unidades = nueva;
    } else {
        struct Unidad *aux = materia->unidades;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Lista de tareas  */

struct Tarea *buscarTarea(struct Unidad *unidad, char *nombre) {
    struct Tarea *aux = unidad->tareas;
    while (aux != NULL) {
        if (strcmp(aux->nombre, nombre) == 0) {
            return aux;
        }
        aux = aux->sig;
    }
    return NULL;
}

void agregarTarea(struct Unidad *unidad, char *nombre, int dia, int mes, int anio, int proyecto) {
    struct Tarea *nueva = (struct Tarea *)malloc(sizeof(struct Tarea));
    strcpy(nueva->nombre, nombre);
    nueva->completada = 0;
    nueva->dia = dia;
    nueva->mes = mes;
    nueva->anio = anio;
    nueva->proyecto = proyecto;
    nueva->sig = NULL;

    if (unidad->tareas == NULL) {
        unidad->tareas = nueva;
    } else {
        struct Tarea *aux = unidad->tareas;
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nueva;
    }
}

/*  Cola de pendientes  */

void encolar(struct Pendiente *nuevo) {
    nuevo->sig = NULL;
    if (frente == NULL) {
        frente = nuevo;
        fin = nuevo;
    } else {
        fin->sig = nuevo;
        fin = nuevo;
    }
}

struct Pendiente *desencolar() {
    if (frente == NULL) {
        return NULL;
    }
    struct Pendiente *sacado = frente;
    frente = frente->sig;
    if (frente == NULL) {
        fin = NULL;
    }
    sacado->sig = NULL;
    return sacado;
}

/*  Pila de completadas  */

void apilar(struct Pendiente *nuevo) {
    nuevo->sig = tope;
    tope = nuevo;
}

struct Pendiente *desapilar() {
    if (tope == NULL) {
        return NULL;
    }
    struct Pendiente *sacado = tope;
    tope = tope->sig;
    sacado->sig = NULL;
    return sacado;
}

/*  Funciones del menu  */

void opcionAgregarMateria() {
    char nombre[50];
    printf("Nombre de la materia: ");
    leerTexto(nombre, 50);

    if (buscarMateria(nombre) != NULL) {
        printf("Esa materia ya existe.\n");
        return;
    }
    agregarMateria(nombre);
    printf("Materia agregada.\n");
}

void opcionAgregarUnidad() {
    char nombreMateria[50];
    char nombreUnidad[50];

    printf("Nombre de la materia: ");
    leerTexto(nombreMateria, 50);
    struct Materia *materia = buscarMateria(nombreMateria);
    if (materia == NULL) {
        printf("Esa materia no existe.\n");
        return;
    }

    printf("Nombre de la unidad: ");
    leerTexto(nombreUnidad, 50);
    if (buscarUnidad(materia, nombreUnidad) != NULL) {
        printf("Esa unidad ya existe en la materia.\n");
        return;
    }
    agregarUnidad(materia, nombreUnidad);
    printf("Unidad agregada.\n");
}

void opcionAgregarTarea() {
    char nombreMateria[50];
    char nombreUnidad[50];
    char nombreTarea[50];

    printf("Nombre de la materia: ");
    leerTexto(nombreMateria, 50);
    struct Materia *materia = buscarMateria(nombreMateria);
    if (materia == NULL) {
        printf("Esa materia no existe.\n");
        return;
    }

    printf("Nombre de la unidad: ");
    leerTexto(nombreUnidad, 50);
    struct Unidad *unidad = buscarUnidad(materia, nombreUnidad);
    if (unidad == NULL) {
        printf("Esa unidad no existe.\n");
        return;
    }

    printf("Nombre de la tarea: ");
    leerTexto(nombreTarea, 50);
    if (buscarTarea(unidad, nombreTarea) != NULL) {
        printf("Esa tarea ya existe en la unidad.\n");
        return;
    }
    int dia = leerEntero("Dia de entrega: ");
    int mes = leerEntero("Mes de entrega: ");
    int anio = leerEntero("Anio de entrega: ");
    if (fechaValida(dia, mes, anio) == 0) {
        printf("Fecha no valida.\n");
        return;
    }
    int proyecto = leerEntero("Es proyecto final? (1 = si, 0 = no): ");
    if (proyecto != 1) {
        proyecto = 0;
    }
    agregarTarea(unidad, nombreTarea, dia, mes, anio, proyecto);

    struct Pendiente *nuevo = (struct Pendiente *)malloc(sizeof(struct Pendiente));
    strcpy(nuevo->tarea, nombreTarea);
    strcpy(nuevo->unidad, nombreUnidad);
    strcpy(nuevo->materia, nombreMateria);
    encolar(nuevo);
    printf("Tarea agregada a pendientes.\n");
}

void mostrarMateria(struct Materia *materia) {
    printf("\nMateria: %s\n", materia->nombre);
    struct Unidad *u = materia->unidades;
    while (u != NULL) {
        printf("  Unidad: %s\n", u->nombre);
        struct Tarea *t = u->tareas;
        while (t != NULL) {
            if (t->completada == 1) {
                printf("    [x] %s", t->nombre);
            } else {
                printf("    [ ] %s", t->nombre);
            }
            printf(" - %02d/%02d/%d", t->dia, t->mes, t->anio);
            if (t->proyecto == 1) {
                printf(" (PROYECTO FINAL)");
            }
            printf("\n");
            t = t->sig;
        }
        u = u->sig;
    }
}

void mostrarMaterias() {
    struct Materia *aux = materias;
    while (aux != NULL) {
        mostrarMateria(aux);
        aux = aux->sig;
    }
}

void opcionVerTodo() {
    if (materias == NULL) {
        printf("Todavia no hay materias.\n");
        return;
    }
    mostrarMaterias();
}

void opcionVerSiguiente() {
    if (frente == NULL) {
        printf("No hay tareas pendientes.\n");
        return;
    }
    printf("Siguiente tarea: %s (%s, %s)\n", frente->tarea, frente->materia, frente->unidad);
}

void opcionCompletar() {
    struct Pendiente *p = desencolar();
    if (p == NULL) {
        printf("No hay tareas pendientes.\n");
        return;
    }

    struct Materia *materia = buscarMateria(p->materia);
    struct Unidad *unidad = buscarUnidad(materia, p->unidad);
    struct Tarea *tarea = buscarTarea(unidad, p->tarea);
    tarea->completada = 1;

    apilar(p);
    printf("Tarea completada: %s\n", p->tarea);
}

void opcionDeshacer() {
    struct Pendiente *p = desapilar();
    if (p == NULL) {
        printf("No hay nada que deshacer.\n");
        return;
    }

    struct Materia *materia = buscarMateria(p->materia);
    struct Unidad *unidad = buscarUnidad(materia, p->unidad);
    struct Tarea *tarea = buscarTarea(unidad, p->tarea);
    tarea->completada = 0;

    encolar(p);
    printf("La tarea %s regreso a pendientes.\n", p->tarea);
}

void opcionHistorial() {
    if (tope == NULL) {
        printf("Todavia no hay tareas completadas.\n");
        return;
    }
    printf("Tareas completadas (la mas reciente primero):\n");
    struct Pendiente *aux = tope;
    while (aux != NULL) {
        printf("  %s (%s, %s)\n", aux->tarea, aux->materia, aux->unidad);
        aux = aux->sig;
    }
}

/*  Calendario  */

void agregarEvento(int dia, struct Tarea *t, char *materia) {
    struct Evento *nuevo = (struct Evento *)malloc(sizeof(struct Evento));
    strcpy(nuevo->nombre, t->nombre);
    strcpy(nuevo->materia, materia);
    nuevo->proyecto = t->proyecto;
    nuevo->completada = t->completada;
    nuevo->sig = NULL;

    if (calendario[dia] == NULL) {
        calendario[dia] = nuevo;
    } else {
        struct Evento *aux = calendario[dia];
        while (aux->sig != NULL) {
            aux = aux->sig;
        }
        aux->sig = nuevo;
    }
}

void llenarCalendario(int mes, int anio) {
    int i;
    for (i = 1; i <= 31; i++) {
        calendario[i] = NULL;
    }

    struct Materia *m = materias;
    while (m != NULL) {
        struct Unidad *u = m->unidades;
        while (u != NULL) {
            struct Tarea *t = u->tareas;
            while (t != NULL) {
                if (t->mes == mes && t->anio == anio) {
                    agregarEvento(t->dia, t, m->nombre);
                }
                t = t->sig;
            }
            u = u->sig;
        }
        m = m->sig;
    }
}

void liberarCalendario() {
    int i;
    for (i = 1; i <= 31; i++) {
        while (calendario[i] != NULL) {
            struct Evento *borrar = calendario[i];
            calendario[i] = calendario[i]->sig;
            free(borrar);
        }
    }
}

void opcionCalendario() {
    int mes = leerEntero("Mes (1-12): ");
    int anio = leerEntero("Anio: ");
    if (mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
        printf("Mes o anio no valido.\n");
        return;
    }

    llenarCalendario(mes, anio);
    int total = diasDelMes(mes, anio);
    int inicio = diaSemana(1, mes, anio);
    int d, i;

    printf("\nCALENDARIO %02d/%d\n", mes, anio);
    printf(" Do  Lu  Ma  Mi  Ju  Vi  Sa\n");
    for (i = 0; i < inicio; i++) {
        printf("    ");
    }
    for (d = 1; d <= total; d++) {
        char marca = ' ';
        struct Evento *e = calendario[d];
        while (e != NULL) {
            if (e->proyecto == 1) {
                marca = 'P';
            } else if (marca != 'P') {
                marca = '*';
            }
            e = e->sig;
        }
        printf("%3d%c", d, marca);
        if ((inicio + d) % 7 == 0) {
            printf("\n");
        }
    }
    if ((inicio + total) % 7 != 0) {
        printf("\n");
    }
    printf("\n* = tarea   P = proyecto final\n\n");

    int hay = 0;
    for (d = 1; d <= total; d++) {
        struct Evento *e = calendario[d];
        while (e != NULL) {
            printf("Dia %02d: ", d);
            if (e->completada == 1) {
                printf("[x] ");
            } else {
                printf("[ ] ");
            }
            printf("%s (%s)", e->nombre, e->materia);
            if (e->proyecto == 1) {
                printf(" - PROYECTO FINAL");
            }
            printf("\n");
            hay = 1;
            e = e->sig;
        }
    }
    if (hay == 0) {
        printf("No hay tareas ni proyectos en este mes.\n");
    }
    liberarCalendario();
}

/ Liberar memoria  /

void liberarPendientes(struct Pendiente *lista) {
    while (lista != NULL) {
        struct Pendiente *borrar = lista;
        lista = lista->sig;
        free(borrar);
    }
}

void liberarMaterias() {
    while (materias != NULL) {
        struct Materia *m = materias;
        materias = materias->sig;

        struct Unidad *u = m->unidades;
        while (u != NULL) {
            struct Tarea *t = u->tareas;
            while (t != NULL) {
                struct Tarea *borrarT = t;
                t = t->sig;
                free(borrarT);
            }
            struct Unidad *borrarU = u;
            u = u->sig;
            free(borrarU);
        }
        free(m);
    }
}

void mostrarMenu() {
    printf("\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf(AZUL "|" AMARILLO "       ORGANIZADOR DE MATERIAS Y TAREAS       " AZUL "|" NORMAL "\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf(AZUL "|" VERDE "   1." NORMAL " Agregar materia                         " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   2." NORMAL " Agregar unidad a una materia            " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   3." NORMAL " Agregar tarea a una unidad              " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   4." NORMAL " Ver todo                                " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   5." NORMAL " Ver siguiente tarea pendiente           " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   6." NORMAL " Completar siguiente tarea pendiente     " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   7." NORMAL " Deshacer ultima tarea completada        " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   8." NORMAL " Ver historial de completadas            " AZUL "|" NORMAL "\n");
    printf(AZUL "|" VERDE "   9." NORMAL " Ver calendario del mes                  " AZUL "|" NORMAL "\n");
    printf(AZUL "|" ROJO "  10." NORMAL " Salir                                   " AZUL "|" NORMAL "\n");
    printf(AZUL "+==============================================+" NORMAL "\n");
    printf("Opcion: ");
}

/*  Programa principal  */

int main() {
    char texto[50];
    system("");
    int opcion = 0;

    while (opcion != 10) {
        mostrarMenu();
        leerTexto(texto, 50);
        opcion = atoi(texto);

        switch (opcion) {
            case 1: opcionAgregarMateria(); break;
            case 2: opcionAgregarUnidad(); break;
            case 3: opcionAgregarTarea(); break;
            case 4: opcionVerTodo(); break;
            case 5: opcionVerSiguiente(); break;
            case 6: opcionCompletar(); break;
            case 7: opcionDeshacer(); break;
            case 8: opcionHistorial(); break;
            case 9: opcionCalendario(); break;
            case 10: printf("Hasta luego.\n"); break;
            default: printf(ROJO "Opcion no valida." NORMAL "\n");
        }
    }

    liberarMaterias();
    liberarPendientes(frente);
    liberarPendientes(tope);
    return 0;
}