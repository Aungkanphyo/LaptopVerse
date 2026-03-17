import { Transform } from '@json2csv/node';

/**
 * To convert a JSON Data Stream to a CSV Stream
 */
export const createCsvTransformStream = (fields: string[]) => {
    return new Transform(
        {
            fields,
            withBOM: true, // avoid losing Myanmaravoid losing Myanmar or special characters in Excel or special characters in Excel
        },
        {},
        { objectMode: true }
    );
};