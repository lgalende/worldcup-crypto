export const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

export function parsePass (pass) {
    switch (pass) {
        case 0:
            return "Bronze pass";
        case 1:
            return "Silver pass";
        case 2:
            return "Gold pass";
        case 3:
            return "Diamond pass";
        default:
            throw new Error("Invalid pass");
    }
};

export function passColor (pass) {
    switch (pass) {
        case 0:
            return "bronze2";
        case 1:
            return "silver2";
        case 2:
            return "gold2";
        case 3:
            return "diamond2";
        default:
            throw new Error("Invalid pass");
    }
};