# Documentación del Componente FilterModal

## Resumen

El `FilterModalComponent` proporciona una interfaz de usuario para aplicar filtros a los datos. Soporta filtros de cadena, numérico y fecha, e interactúa con el `FilterService` para gestionar los estados de los filtros.

## Salidas

## Métodos

- **`ngOnInit()`**: Revisa si hay filtros guardados en el FilterService
- **`addFilter()`**: Agrega un nuevo filtro basado en el tipo de filtro seleccionado.
- **`removeFilter(index: number)`**: Elimina un filtro en el índice especificado.
- **`resetFilters()`**: Borra todos los filtros.
- **`filtrar()`**: Procesa y aplica filtros.

## Funcionamiento

Los usuarios pueden seleccionar un filtro desde el menú desplegable y añadirlo con el botón **+**. Modificar el filtro y filtrar mediante el botón **Filtrar**.

### Añadir nuevas rutas

Al iniciar el componente, revisa el nombre de la ruta para conocer los distintos filtros que podrán ser aplicados.
Para añadir un nuevo set de filtros asociados a una ruta, se debe añadir una entrada a **selectOptions**.

### Añadir Nuevos Tipos de Filtros

♦ Amplía el array de una entrada de **selectOptions** para incluir filtros adicionales según sea necesario. Las rutas deben contener un array con los filtros disponibles.

#### Formato de filtros

**filtro: { value: string; label: string: type: string }**
• value: nombre del campo que recibirá backed en el campo filterBy.
• label: string que se mostrará en la interface del filter.
• type: tipo de filtro. Por el momento solo hay 3 tipos de filtros: string, numeric, date.

```typescript
selectOptions: { [key: string]: { value: string; label: string; type: string }[] } = {
    deudas: [
      { value: 'idDebt', label: 'ID Deuda', type: 'string' },
      { value: 'dueDate', label: 'Vencimiento', type: 'date' },
      { value: 'fileDate', label: 'Fecha archivo', type: 'date' },
      { value: 'amount', label: 'Monto', type: 'numeric' },
    ],
    nuevaRuta: [
      // Filtros de ruta nueva
      { value: 'xxxxx', label: 'yyyyy', type: 'string' },
    ]
}
```

♦ Personalizar Filtros: Modifica el método addFilter para manejar nuevas configuraciones y tipos de filtros.
