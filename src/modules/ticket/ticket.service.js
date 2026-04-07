import pg from '../../shared/db/postgres.js';

const validateTicket = async ticketId => {
  const result = await pg.query(
    'SELECT id, scanned_at FROM tickets WHERE id = $1',
    [ticketId]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid ticket');
  }

  if (result.rows[0].scanned_at) {
    throw new Error('Ticket already used');
  }

  return result.rows[0];
};

const checkInTicket = async (ticketId, eventId) => {
  const client = await pg.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT id, scanned_at
       FROM tickets
       WHERE id = $1
       FOR UPDATE`,
      [ticketId]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid ticket');
    }

    if (result.rows[0].scanned_at) {
      throw new Error('Already checked in');
    }

    await client.query(
      `UPDATE tickets
       SET scanned_at = NOW(),
           event_id = $1
       WHERE id = $2`,
      [eventId, ticketId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export { validateTicket, checkInTicket };
