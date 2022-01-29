import { BlockDetails } from "./definitions";

/**
 * @param height expiration block
 * @param currentBlock last block to be minted
 * @param avgBlockTime Average time produce a block
 * @returns {Date} meaning the expected date to expire
 */
export const calculateExpireDate = (height: number, currentBlock: BlockDetails, avgBlockTime: number): Date => {
    // This is an approximate expiring date with a delta value of avgBlockTime. 
    // In other words, this value is not the guaranteed to be the same all the time. 
    // It depends on how close are we to produce the next block
    let timeToExpire = avgBlockTime * (height - currentBlock.height);
    return new Date(currentBlock.burn_block_time + timeToExpire);
}
