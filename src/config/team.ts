// Who can sign in, and which 5k-os client folders each person sees.
// Client values are folder names under 5k-os/clients/.

export type TeamMember = {
  email: string;
  name: string;
  clients: string[];
};

export const ALLOWED_DOMAIN = "5k.co";

export const TEAM: TeamMember[] = [
  {
    email: "laney@5k.co",
    name: "Laney",
    clients: [
      "arizona-diamond-center",
      "bulk-memory-cards",
      "camp-highlander",
      "neckers-jewelers",
      "the-beer-lodge",
      "ultrabrightlightz",
    ],
  },
  // Jairus: add { email, name: "Jairus", clients: [...] } once his email and clients are confirmed.
];

export function findMember(email: string): TeamMember | undefined {
  const normalized = email.trim().toLowerCase();
  return TEAM.find((member) => member.email.toLowerCase() === normalized);
}
