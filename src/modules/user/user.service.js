import pg from '../../shared/db/postgres.js';

/** @import { User } from '../../types/user.js' */

/**
 * Get user by ticket code.
 * Return the checkin status for returning users.
 *
 * @param {string} ticketCode
 * @returns {Promise<User|null>}
 */
export const getUserByTicket = async (ticketCode) => {
  const result = await pg.query(
    `SELECT
      user_id,
      user_phone,
      user_name,
      checkin_complete,
      checkin_at,
      checkin_number
    FROM users
    WHERE ticket_code = $1`,
    [ticketCode],
  );

  return result.rows[0] || null;
};

/**
 * Atomically marks a user as checked in and assigns a unique
 * sequential checkin number using postgres sequence.
 *
 * @param {string} ticketCode
 *
 * @returns {{ checkinNumber: number, checkinAt: Date }}
 */
export const completeCheckin = async (ticketCode) => {
  const client = await pg.connect();

  try {
    await client.query('BEGIN');

    // lock the row
    const { rows } = await client.query(
      `SELECT
        ticket_code,
        checkin_complete,
        checkin_at,
        checkin_number
      FROM users
      WHERE ticket_code = $1
      FOR UPDATE`,
      [ticketCode],
    );

    if (rows.length === 0) throw new Error('Ticket not found');

    if (rows[0].checkin_complete && rows[0].checkin_number) {
      await client.query('COMMIT');

      return {
        checkinNumber: rows[0].checkin_number,
        checkinAt: rows[0].checkin_at,
      };
    }

    // generate unique and sequential checkin_number
    const sequenceResult = await client.query(
      `SELECT nextval('checkin_number_seq') AS num`,
    );

    const checkinNumber = parseInt(sequenceResult.rows[0].num, 10);
    const checkinAt = new Date();

    await client.query(
      `UPDATE users
      SET checkin_complete = TRUE,
        checkin_at = $1,
        checkin_number = $2,
        updated_at = NOW()
      WHERE ticket_code = $3`,
      [checkinAt, checkinNumber, ticketCode],
    );

    await client.query('COMMIT');

    return { checkinNumber, checkinAt };
  } catch (err) {
    await client.query('ROLLBACK');

    throw err;
  } finally {
    client.release();
  }
};
