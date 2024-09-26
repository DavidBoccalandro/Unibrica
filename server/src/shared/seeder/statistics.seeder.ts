import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { StatisticsPaymentEntity } from 'src/statistics/entities/statisticsPayment.entity';
import { SheetEntity } from '../entities/sheet.entity';
import { DataSourceConfig } from 'src/config/data.source';
import { StatisticsDebtEntity } from 'src/statistics/entities/statisticsDebt.entity';

const dataSource = new DataSource(DataSourceConfig);

async function seedDatabase() {
  await dataSource.initialize();

  const clientRepo = dataSource.getRepository(ClientEntity);
  const sheetRepo = dataSource.getRepository(SheetEntity);
  const statisticsPaymentRepo = dataSource.getRepository(StatisticsPaymentEntity);
  const statisticsDebtRepo = dataSource.getRepository(StatisticsDebtEntity);

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
    for (let i = 0; i < 120; i++) {
      const date = faker.date
        //! Ajustar la fecha de los sheets
        // .between({ from: '2024-08-01', to: '2024-09-30' }) // último mes
        .between({ from: '2023-08-01', to: '2024-09-30' }) // último año
        .toISOString()
        .split('T')[0];

      // Verificar si ya existe un archivo para esa fecha
      if (!clientDateMap.has(client.name)) {
        clientDateMap.set(client.name, new Set());
      }

      const datesSet = clientDateMap.get(client.name);

      if (!datesSet.has(date)) {
        // Crear la hoja
        const sheet = new SheetEntity();
        sheet.fileName = generateFileName();
        sheet.date = new Date(date);
        sheet.client = client;

        await sheetRepo.save(sheet);

        // Crear la estadística de deudas
        const debtStatistic = new StatisticsDebtEntity();
        // This should be a date a week before paymentStatistic.date
        debtStatistic.date = new Date(new Date(date).setDate(new Date(date).getDate() - 7));
        debtStatistic.totalDebtAmount = faker.number.float({ min: 0, max: 1000000 });
        debtStatistic.client = client;
        debtStatistic.sheet = sheet;

        // Crear la estadística de pagos
        const paymentStatistic = new StatisticsPaymentEntity();
        paymentStatistic.date = new Date(date);
        paymentStatistic.totalDebitAmount = faker.number.float({
          min: 0,
          max: debtStatistic.totalDebtAmount,
        });
        paymentStatistic.totalRemainingDebt = faker.number.float({ min: 0, max: 1000000 });
        paymentStatistic.client = client;
        paymentStatistic.sheet = sheet;

        await statisticsPaymentRepo.save(paymentStatistic);
        await statisticsDebtRepo.save(debtStatistic);

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
