import { BankEntity } from 'src/banks/entities/banks.entity';
import { SheetEntity } from 'src/shared/entities/sheet.entity';
import { DebtorEntity } from '../entities/debtors.entity';
import { ClientEntity } from 'src/clients/entities/clients.entity';
import { DebtEntity } from '../entities/debts.entity';

interface ProcessedRowData {
  debtor: {
    dni: string;
    firstNames: string;
    lastNames: string;
  };
  debt: {
    amount: number;
    idDebt: string;
    branchCode: string;
    accountType: string;
    account: string;
    currency: string;
    dueDate: Date;
  };
  bank: BankEntity | null;
}

export function processDebtExcelRow(row: any, bankMap: Map<string, BankEntity>): ProcessedRowData {
  // Extraer datos del deudor
  const dni = row['DNI'].toString();
  const fullName = row['NOMBRE Y APELLIDO'].split(' ');
  const lastNames = fullName[0]; // Primer palabra como apellido
  const firstNames = fullName.slice(1).join(' '); // El resto como nombres

  // Buscar banco en el map
  const bank = bankMap.get(row['bank']) ?? null;

  // Procesar monto de la deuda
  const amount = parseFloat(row['Importe']) / 100; // Suponiendo que está en centavos

  // Formatear la fecha de vencimiento (asume que es un formato de AAAAMMDD)
  const dateString = row['Fecha_vto'].toString();
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1; // Los meses son de 0 a 11 en JS
  const day = parseInt(dateString.slice(6, 8), 10);
  const dueDate = new Date(year, month, day);

  // Extraer el resto de los datos de la deuda
  const debt = {
    amount,
    idDebt: row['Id_debito'],
    branchCode: row['Sucursal'],
    accountType: row['Tipo_Cuenta'],
    account: row['Cuenta'],
    currency: row['Moneda'].replace(/'/g, ''), // Reemplazar apóstrofes si existen
    dueDate,
  };

  // Retornar un objeto estructurado con la información procesada
  return {
    debtor: {
      dni,
      firstNames,
      lastNames,
    },
    debt,
    bank,
  };
}

export function createDebt(
  processedRow: ProcessedRowData,
  debtor: DebtorEntity,
  client: ClientEntity,
  sheet: SheetEntity
): DebtEntity {
  // Crear una nueva instancia de DebtEntity
  const debt = new DebtEntity();

  // Asignar los valores de la deuda desde processedRow
  debt.amount = processedRow.debt.amount;
  debt.idDebt = processedRow.debt.idDebt;
  debt.branchCode = +processedRow.debt.branchCode;
  debt.accountType = +processedRow.debt.accountType;
  debt.account = processedRow.debt.account;
  debt.currency = processedRow.debt.currency;
  debt.dueDate = processedRow.debt.dueDate;

  // Asignar relaciones de la deuda
  debt.bank = processedRow.bank; // Banco asociado (puede ser null si no existe)
  debt.debtor = debtor; // Deudor asociado
  debt.client = client; // Cliente asociado
  debt.sheet = sheet; // Hoja asociada

  // Devolver la instancia de DebtEntity lista para ser guardada en la base de datos
  return debt;
}

export async function handleDebtor(
  row: ProcessedRowData,
  sheet: SheetEntity,
  debtorsMap: Map<string, DebtorEntity>
): Promise<DebtorEntity> {
  const { dni, firstNames, lastNames } = row.debtor;

  // Intentar obtener el deudor del mapa utilizando el DNI
  let debtor = debtorsMap.get(dni);

  // Si el deudor no existe, se crea uno nuevo
  if (!debtor) {
    debtor = new DebtorEntity();
    debtor.dni = dni;
    debtor.firstNames = firstNames;
    debtor.lastNames = lastNames;
    debtor.sheet = sheet;

    // Guardar el nuevo deudor en el mapa para futuras referencias
    debtorsMap.set(dni, debtor);

    return debtor;
  }

  // Si el deudor ya existe, buscar si está en la tabla de deudores repetidos
  let repeatedDebtor = await this.repeatedDebtorRepository.findOne({
    where: { debtor: { dni: debtor.dni } },
    relations: ['debtor', 'sheets'],
  });

  // Si el deudor repetido no existe, crear un nuevo registro
  if (!repeatedDebtor) {
    repeatedDebtor = this.repeatedDebtorRepository.create({
      debtor,
      sheets: [sheet],
    });
    await this.repeatedDebtorRepository.save(repeatedDebtor);
  } else {
    // Si el deudor repetido ya existe, verificar si ya tiene la hoja actual asociada
    const sheetExists = repeatedDebtor.sheets.some(
      (existingSheet) => existingSheet.id === sheet.id
    );

    if (!sheetExists) {
      repeatedDebtor.sheets.push(sheet);
      await this.repeatedDebtorRepository.save(repeatedDebtor);
    }
  }

  // Retornar el deudor (ya sea uno nuevo o uno existente)
  return debtor;
}
