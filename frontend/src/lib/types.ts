export interface Track {
    title?: string;
    artist?: string;
    image_link?: string;
    spotify_id?: string;
}

export interface Settings {
    volume: number;
    roundTimer: number;
    mode: 'casual' | 'training';
    roomName: string | null;
    deviceId: string | null;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
}
