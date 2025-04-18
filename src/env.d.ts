/// <reference types="astro/client" />

declare namespace App {
	interface Locals extends Record<string, JSONValue> {
		title: string;
		getAlterTitle: string;
		// Añade aquí otras propiedades si las necesitas
	}
}