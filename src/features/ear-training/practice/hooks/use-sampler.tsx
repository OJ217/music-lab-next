import { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export const useSampler = () => {
	const samplerInstance = useRef<Tone.Sampler>();

	const initializeSampler = useCallback(() => {
		const sampler = new Tone.Sampler({
			urls: {
				C4: 'C4.mp3',
				'D#4': 'Ds4.mp3',
				'F#4': 'Fs4.mp3',
				A4: 'A4.mp3'
			},
			release: 2,
			baseUrl: 'https://tonejs.github.io/audio/salamander/',
			onload: () => {
				samplerInstance.current = sampler;
			}
		}).toDestination();
	}, []);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			initializeSampler();

			return () => {
				samplerInstance.current?.disconnect();
				samplerInstance.current = undefined;
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return samplerInstance;
};

interface SamplerMethods {
	playNotes: (notes: Array<string | string[]>, noteDuration: number) => void;
	releaseNotes: (releaseTime?: number | undefined) => void;
}

export const useSamplerMethods = (): SamplerMethods => {
	const samplerInstance = useSampler();

	const playNotes = useCallback(
		(notes: Array<string | string[]>, noteDuration: number) => {
			notes.forEach((note, index) => {
				console.log(note);
				const time = Tone.now() + index * noteDuration;
				samplerInstance?.current?.triggerAttackRelease(note, noteDuration, time);
			});
		},
		[samplerInstance]
	);

	const releaseNotes = useCallback(
		(releaseTime?: number | undefined) => {
			samplerInstance.current?.releaseAll(releaseTime);
		},
		[samplerInstance]
	);

	return {
		playNotes,
		releaseNotes
	};
};
