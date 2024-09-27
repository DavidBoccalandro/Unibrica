/**
 * Procesa las líneas de un archivo SDA y extrae ciertos datos.
 *
 * Esta función procesa un archivo SDA, extrayendo información de cada línea, en particular el número de cuenta
 * y el código de equivalencia de rechazo. El archivo SDA contiene datos financieros formateados en líneas
 * de texto, donde cada posición de la línea representa un dato específico.
 *
 * @param {Express.Multer.File} file - El archivo SDA cargado a través de Multer.
 *                                     Contiene datos como `buffer` (el contenido del archivo en formato binario)
 *                                     y `originalname` (el nombre original del archivo).
 *
 * @returns {Map<string, string>} - Un `Map` donde la clave es el número de cuenta
 *                                  y el valor es el código de equivalencia de rechazo.
 *                                  Si no hay un archivo proporcionado o si se produce un error al procesar las líneas, devuelve un `Map` vacío.
 *
 * @throws - Si ocurre algún error al procesar una línea específica, este error se captura, se muestra un mensaje en la consola,
 *           y la función continúa con la siguiente línea.
 */

export function processSdaLines(file: Express.Multer.File) {
  const fileContentSda = file.buffer.toString('utf-8');
  const linesSda = fileContentSda.split('\n');
  // const originalFileNameSda = path.basename(file.originalname);
  const optionalDataMap = new Map<string, any>();

  if (file) {
    for (const line of linesSda) {
      // console.log('Linea SDA: ', line);
      try {
        const mapAux = {
          //   tipoRegistro: line.substring(0, 1).trim(),
          //   convenio: line.substring(1, 6).trim(),
          //   servicio: line.substring(6, 16).trim(),
          //   empresaCredito: line.substring(16, 21).trim(),
          //   banco: line.substring(21, 24).trim(),
          //   sucursal: line.substring(24, 28).trim(),
          //   tipoCuenta: line.substring(28, 29).trim(),
          //   nroCuenta: line.substring(29, 44).trim(),
          //   codigoAdhesion: line.substring(44, 66).trim(),
          idDebito: line.substring(66, 81).trim(),
          //   usoMov: line.substring(81, 83).trim(),
          //   equivalenciaRechazo: line.substring(83, 87).trim(),
          //   anoVto: line.substring(87, 91).trim(),
          //   mesVto: line.substring(91, 93).trim(),
          //   diaVto: line.substring(93, 95).trim(),
          //   moneda: line.substring(95, 98).trim(),
          //   importeDebitar: line.substring(98, 111).trim(),
          //   anoReintento: line.substring(111, 115).trim(),
          //   mesReintento: line.substring(115, 117).trim(),
          //   diaReintentos: line.substring(117, 119).trim(),
          //   importeDebitado: line.substring(119, 132).trim(),
          //   sucursalNueva: line.substring(132, 136).trim(),
          //   tipoCuentaNueva: line.substring(136, 137).trim(),
          //   nroCuentaNueva: line.substring(137, 152).trim(),
          //   codigoAdhesionNuevo: line.substring(152, 174).trim(),
          //   retorno: line.substring(174, 214).trim(),
          //   sinUso: line.substring(214, 219).trim(),
          //   filler: line.substring(219, 220).trim(),
        };
        // console.log('AuxMap: ', mapAux)

        // console.log('idDebito: ', mapAux['idDebito']);
        const siglasMatchA = line
          .substring(66, 81)
          .trim()
          .match(/(?<=0)[A-Z][A-Z0-9]{1}(?=\D).|(?<=0)[A-Z][A-Z0-9]{1}/g);
        optionalDataMap.set(line.substring(29, 44).trim(), line.substring(83, 87).trim());
      } catch (error) {
        console.error(`Error processing optional file line: ${line}. Error: ${error.message}`);
        continue;
      }
    }
    return optionalDataMap;
  }

  return;
}
