/**
 * @brief Function to see if the ball makes contact with player1.
 *   -> `player1` is to the left of `player2`
 *   -> check 'top', 'bottom', and 'right' of player1. 
 * 
 * @returns bool True if ball is in contact with player 1
 */
export function p1Contact(bx, by, br, px, py, pr) {
  // check right, bottom, top in that order
  if ( (bx-br) < px && by < (py+pr) && by > (py-pr) ) {
    return true;
  }
  return false;
}

/**
 * @brief Function to see if the ball makes contact with player2.
 *   -> `player2` is to the right of `player1`
 *   -> check 'top', 'bottom', and 'left' of player2. 
 * 
 * @returns bool True if ball is in contact with player 2
 */
export function p2Contact(bx, by, br, px, py, pr) {
  // check left, bottom, top in that order
  if ( (bx+br) > px && by < (py+pr) && by > (py-pr) ) {
    return true;
  }
  return false;
}
