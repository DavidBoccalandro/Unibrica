import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { StatisticsEntity } from 'src/statistics/entities/statistic.entity';
import { SheetsEntity } from '../entities/debtSheets.entity';
import { DataSourceConfig } from 'src/config/data.source';

const dataSource = new DataSource(DataSourceConfig);

async function seedDatabase() {
  await dataSource.initialize();

  const clientRepo = dataSource.getRepository(ClientEntity);
  const sheetRepo = dataSource.getRepository(SheetsEntity);
  const statisticsRepo = dataSource.getRepository(StatisticsEntity);

  // Obtener todos los clientes existentes
  const clients = await clientRepo.find();
  if (clients.length === 0) {
    throw new Error('No hay clientes disponibles en la base de datos');
  }

  // Seleccionar un cliente al azar
  // const client = clients[Math.floor(Math.random() * clients.length)];

  // Mapa para rastrear fechas de hojas por cliente
  const clientDateMap = new Map<string, Set<string>>();

  // Crear hojas y estadísticas ficticias
  for (const client of clients) {
    //! Ajustar la cantidad de stadistics que se generarán por client
    for (let i = 0; i < 100; i++) {
      const date = faker.date
        .between({ from: '2023-09-01', to: '2024-09-30' }) //! Ajustar la fecha de los sheets
        .toISOString()
        .split('T')[0];

      // Verificar si ya existe un archivo para esa fecha
      if (!clientDateMap.has(client.name)) {
        clientDateMap.set(client.name, new Set());
      }

      const datesSet = clientDateMap.get(client.name);

      if (!datesSet.has(date)) {
        // Crear la hoja
        const sheet = new SheetsEntity();
        sheet.fileName = generateFileName();
        sheet.date = new Date(date);
        sheet.client = client;

        await sheetRepo.save(sheet);

        // Crear la estadística
        const statistic = new StatisticsEntity();
        statistic.date = new Date(date);
        statistic.totalDebitAmount = faker.number.float({ min: 0, max: 1000000 });
        statistic.client = client;
        statistic.sheet = sheet;

        await statisticsRepo.save(statistic);

        // Añadir la fecha al conjunto de fechas
        datesSet.add(date);
      }
      console.log('Se repitió la fecha: ', date, datesSet);
    }
  }

  console.log('Base de datos poblada con datos ficticios.');
}

seedDatabase()
  .catch((error) => console.log('Error al poblar la base de datos:', error))
  .finally(() => dataSource.destroy());

// Función para generar nombres de archivo ficticios con un patrón específico
function generateFileName(): string {
  const prefix = 'pagpa';
  const randomNumber = faker.number.int({ min: 10000, max: 99999 });
  const date = faker.date.between({ from: '2024-08-01', to: '2024-09-30' });
  const formattedDate = date.toISOString().split('T')[0].replace(/-/g, '');
  const suffix = `of${faker.number.int({ min: 100, max: 999 })}.lis`;

  return `${prefix}${randomNumber}_${formattedDate}_${suffix}`;
}
