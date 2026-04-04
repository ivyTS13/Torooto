import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const DeckExplorer = () => {
  const location = useLocation();
  const deck = location.state?.deckInfo;
  const [selectedCard, setSelectedCard] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, card: null, x: 0, y: 0 });

  // ========== REPLACE WITH YOUR OWN CARD DATA ==========
  const cards =  [
    {
      "card_id": "99986ec3-f9c1-476c-b023-b8d82bc8d5af",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XXI - The World",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Earth / Saturn",
        "upright_meaning": "The World represents the end of a cycle, achievement, and integration. A dancer surrounded by a wreath celebrates the completion of a journey. This card signifies fulfillment, success, and a sense of wholeness. You've reached a milestone—celebrate and prepare for the next cycle.",
        "reversed_meaning": "Reversed, The World suggests a feeling of incompleteness or delays in reaching your goals. You may be close to the finish line but facing obstacles. It can also indicate a need to tie up loose ends before moving forward.",
        "upright_keywords": "completion, accomplishment, travel",
        "reversed_keywords": "lack of closure, delays"
      },
      "card_position": 21,
      "deleted_at": null
    },
    {
      "card_id": "7b427126-b600-478d-ad59-e15d9a0a5c00",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "VII - The Chariot",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Moon",
        "upright_meaning": "The Chariot depicts a triumphant warrior driving a chariot pulled by two opposing forces, symbolizing mastery over conflicting emotions. This card represents determination, willpower, and the ability to overcome obstacles through focus and control. It's a sign that you're on the path to victory—keep pushing forward.",
        "reversed_meaning": "Reversed, The Chariot warns of lost control or direction. You may be facing unexpected obstacles, feeling overwhelmed, or letting your emotions drive you off course. It can also indicate aggressive behavior or a need to regain balance.",
        "upright_keywords": "control, willpower, success, determination",
        "reversed_keywords": "lack of control, aggression, obstacles"
      },
      "card_position": 7,
      "deleted_at": null
    },
    {
      "card_id": "ed5a962f-c4b4-4bf2-ac08-a056d8003721",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "VIII - Strength",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Sun",
        "upright_meaning": "Strength portrays a woman gently taming a lion, representing inner power, patience, and compassion. This card is about harnessing your inner strength to face challenges with grace and empathy. It encourages you to be brave, gentle, and to lead with the heart rather than force.",
        "reversed_meaning": "Reversed, Strength reveals a lack of confidence or self-control. You may be feeling weak, insecure, or letting fear dominate your actions. It can also indicate being overwhelmed by emotions or using force instead of compassion.",
        "upright_keywords": "courage, inner strength, compassion, influence",
        "reversed_keywords": "self-doubt, weakness, insecurity"
      },
      "card_position": 8,
      "deleted_at": null
    },
    {
      "card_id": "7b43bd36-dd9c-48ca-a9c3-3e321e41390a",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "IX - The Hermit",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Earth / Mercury",
        "upright_meaning": "The Hermit stands alone on a mountain peak, holding a lantern that illuminates the path. This card signifies a period of introspection, soul-searching, and inner guidance. It's a time to withdraw from the world, reflect on your life, and seek answers within. The Hermit's light will guide you to wisdom.",
        "reversed_meaning": "Reversed, The Hermit suggests excessive isolation or loneliness. You may be withdrawing too much, avoiding social contact, or feeling lost without direction. It can also indicate a refusal to seek help or a fear of introspection.",
        "upright_keywords": "introspection, solitude, soul-searching",
        "reversed_keywords": "isolation, loneliness, withdrawal"
      },
      "card_position": 9,
      "deleted_at": null
    },
    {
      "card_id": "72aaf5b9-814c-4873-849e-f77f2a26573c",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "X - Wheel of Fortune",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Jupiter",
        "upright_meaning": "The Wheel of Fortune represents the ever-turning cycles of life—luck, fate, and pivotal moments. It reminds us that everything is in flux; what goes down must come up. This card signals a turning point, an unexpected opportunity, or a change in fortune. Embrace the flow of life.",
        "reversed_meaning": "Reversed, The Wheel of Fortune indicates resistance to change or feeling stuck in a rut. You may be experiencing bad luck, delays, or a sense of being at the mercy of external events. It's a reminder that change is inevitable—adapt or be left behind.",
        "upright_keywords": "change, cycles, destiny, turning point",
        "reversed_keywords": "bad luck, resistance to change, external forces"
      },
      "card_position": 10,
      "deleted_at": null
    },
    {
      "card_id": "49c409cc-c387-4689-80fc-606cebc160e5",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XI - Justice",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Air / Venus",
        "upright_meaning": "Justice holds scales and a sword, representing balance, truth, and accountability. This card calls for fairness, honesty, and weighing decisions carefully. It often indicates legal matters, contracts, or karmic consequences. The universe is watching—make choices that align with integrity.",
        "reversed_meaning": "Reversed, Justice warns of injustice, dishonesty, or imbalance. You may be facing unfair treatment, ignoring the truth, or avoiding responsibility. It can also indicate a need to rebalance your life or correct a wrong.",
        "upright_keywords": "justice, fairness, truth, cause and effect",
        "reversed_keywords": "dishonesty, unfairness, lack of accountability"
      },
      "card_position": 11,
      "deleted_at": null
    },
    {
      "card_id": "4f386d1c-b05a-4203-bbc2-c542575b8d3e",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XII - The Hanged Man",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Neptune",
        "upright_meaning": "The Hanged Man hangs upside down, willingly suspended, symbolizing surrender and a shift in perspective. This card suggests that by letting go of control and seeing things from a different angle, you'll gain enlightenment. It's a time of pause, sacrifice, and patience.",
        "reversed_meaning": "Reversed, The Hanged Man indicates resistance to change or unnecessary delays. You may be stuck in a rut, refusing to let go, or avoiding the need for a new viewpoint. It can also signal a fear of sacrifice or a lack of progress.",
        "upright_keywords": "surrender, new perspective, letting go",
        "reversed_keywords": "stalling, delays, resistance"
      },
      "card_position": 12,
      "deleted_at": null
    },
    {
      "card_id": "ee275a1c-fb49-4a31-8ebc-2a8defee13aa",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XIII - Death",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Pluto",
        "upright_meaning": "Death is one of the most misunderstood cards—it rarely means physical death. Instead, it represents profound transformation, the end of one phase, and the beginning of another. Something must die to make way for new growth. Embrace change and release what no longer serves you.",
        "reversed_meaning": "Reversed, Death suggests a fear of change or an inability to let go. You may be clinging to the past, avoiding necessary endings, or feeling stagnant. It can also indicate a transformative process that's being delayed or resisted.",
        "upright_keywords": "endings, change, transformation",
        "reversed_keywords": "resistance to change, personal transformation"
      },
      "card_position": 13,
      "deleted_at": null
    },
    {
      "card_id": "077b676b-15af-48f4-adb1-9d9998a76ec3",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XIV - Temperance",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Jupiter",
        "upright_meaning": "Temperance depicts an angel mixing waters, symbolizing alchemy, balance, and blending opposites. This card encourages patience, moderation, and finding harmony in life. It's about bringing together different aspects of yourself to create a peaceful whole. Trust the process and flow.",
        "reversed_meaning": "Reversed, Temperance warns of imbalance or excess. You may be overindulging, acting impatiently, or struggling to find harmony. It can also indicate conflicts that need resolution or a need to slow down and re-center.",
        "upright_keywords": "balance, moderation, patience, purpose",
        "reversed_keywords": "imbalance, excess, discord"
      },
      "card_position": 14,
      "deleted_at": null
    },
    {
      "card_id": "7abd73ad-3eb4-4df5-8dd5-97c75de8b607",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XV - The Devil",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Earth / Saturn",
        "upright_meaning": "The Devil represents bondage to material desires, addictions, or unhealthy patterns. He chains the figures, but the chains are loose—they can be broken. This card calls you to examine what holds you back: fear, attachment, or negative habits. It also invites playful exploration of your shadow side.",
        "reversed_meaning": "Reversed, The Devil signals liberation from bondage. You're breaking free from addictions, toxic relationships, or limiting beliefs. It's a time to reclaim your power and choose a healthier path. However, it can also indicate a fear of freedom.",
        "upright_keywords": "addiction, materialism, playfulness, shadow self",
        "reversed_keywords": "freedom, release, reclaiming power"
      },
      "card_position": 15,
      "deleted_at": null
    },
    {
      "card_id": "843c8eb4-1337-4a22-b164-3f0e846bcce2",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XVI - The Tower",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Mars",
        "upright_meaning": "The Tower is struck by lightning, crumbling to the ground—symbolizing sudden upheaval, disaster, or a shocking revelation. This card represents the collapse of old structures, whether beliefs, relationships, or situations. Though painful, it clears the way for rebuilding on a stronger foundation.",
        "reversed_meaning": "Reversed, The Tower suggests avoiding necessary change or delaying the inevitable. You may be clinging to a crumbling structure out of fear. It can also indicate a less dramatic upheaval or an internal crisis that's not visible to others.",
        "upright_keywords": "sudden change, upheaval, chaos, revelation",
        "reversed_keywords": "avoidance of disaster, fear of change"
      },
      "card_position": 16,
      "deleted_at": null
    },
    {
      "card_id": "c2d13e33-6799-4141-b993-d8fd6d055d8a",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XVII - The Star",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Air / Uranus",
        "upright_meaning": "The Star is a beacon of hope, healing, and serenity. After the chaos of The Tower, The Star brings calm and renewal. It represents optimism, inspiration, and a connection to the divine. This card encourages you to have faith in the future and trust that the universe has a plan.",
        "reversed_meaning": "Reversed, The Star signifies a loss of hope or direction. You may feel disillusioned, uninspired, or disconnected from your purpose. It can also indicate a need for self-care and healing to restore faith.",
        "upright_keywords": "hope, faith, purpose, inspiration",
        "reversed_keywords": "despair, hopelessness, lack of faith"
      },
      "card_position": 17,
      "deleted_at": null
    },
    {
      "card_id": "6b95c7de-1a1b-4d98-8ada-af1d8fd54d77",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XVIII - The Moon",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Neptune",
        "upright_meaning": "The Moon illuminates a path through the subconscious, where shadows and fears lurk. It represents intuition, dreams, and the unknown. This card warns of illusions, hidden truths, and anxiety. Trust your instincts and navigate the darkness with courage.",
        "reversed_meaning": "Reversed, The Moon suggests emerging from confusion or fear. You're beginning to see things clearly and release repressed emotions. However, it can also indicate denial of fears or being stuck in illusion.",
        "upright_keywords": "illusion, fear, anxiety, subconscious",
        "reversed_keywords": "release of fear, repressed emotions"
      },
      "card_position": 18,
      "deleted_at": null
    },
    {
      "card_id": "d8324063-96ee-4d37-8679-10079f1a6901",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XIX - The Sun",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Sun",
        "upright_meaning": "The Sun radiates warmth, joy, and success. It's one of the most positive cards, representing happiness, vitality, and achievement. Everything is bright and clear. This card promises a time of celebration, optimism, and fulfillment.",
        "reversed_meaning": "Reversed, The Sun suggests minor setbacks or a lack of optimism. You may be feeling down, experiencing delays, or struggling to see the bright side. But the clouds are temporary—sunshine will return.",
        "upright_keywords": "success, joy, positivity, vitality",
        "reversed_keywords": "temporary setbacks, lack of enthusiasm"
      },
      "card_position": 19,
      "deleted_at": null
    },
    {
      "card_id": "48fe9faa-5088-441e-9667-ec0d82729977",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "XX - Judgment",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Pluto",
        "upright_meaning": "Judgment depicts the dead rising from graves, called to a higher purpose. It symbolizes self-evaluation, forgiveness, and awakening. This card invites you to reflect on your past, make amends, and answer a higher calling. It's a time of personal transformation and renewal.",
        "reversed_meaning": "Reversed, Judgment indicates self-doubt, avoidance of self-reflection, or refusal to heed a calling. You may be judging yourself harshly or ignoring opportunities for growth. It can also signal a need to forgive yourself.",
        "upright_keywords": "reflection, reckoning, awakening",
        "reversed_keywords": "self-doubt, refusal to change"
      },
      "card_position": 20,
      "deleted_at": null
    },
    {
      "card_id": "dc793841-ec7b-4d02-ad94-44f4b30ff2f0",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "0 - The Fool",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Air / Uranus",
        "upright_meaning": "The Fool represents boundless potential, spontaneity, and a leap of faith. He stands at the cliff's edge, ready to begin a journey with optimism and trust in the universe. This card encourages you to embrace the unknown, take risks, and approach life with a childlike wonder. It's a reminder that every ending is a new beginning.",
        "reversed_meaning": "When reversed, The Fool warns of naivety turning into foolishness. You may be rushing into situations without thinking, ignoring red flags, or taking unnecessary risks. It can also indicate feeling held back from starting something new due to fear or external pressures.",
        "upright_keywords": "innocence, new beginnings, free spirit",
        "reversed_keywords": "recklessness, taken advantage of, inconsideration"
      },
      "card_position": 0,
      "deleted_at": null
    },
    {
      "card_id": "b45a4c28-0189-4b88-b77a-ef3c10538afd",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "I - The Magician",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Air / Mercury",
        "upright_meaning": "The Magician symbolizes the power to turn ideas into reality. With the four suits of the tarot on his table, he has all the tools he needs to create. This card signifies focus, willpower, and the ability to harness your skills and resources to achieve your goals. It's a call to take action and trust in your own capabilities.",
        "reversed_meaning": "Reversed, The Magician suggests misuse of power or a lack of direction. You might be manipulating others, feeling unprepared, or not using your talents effectively. It can also indicate blocks in your creative flow or delays in manifesting your desires.",
        "upright_keywords": "manifestation, resourcefulness, power",
        "reversed_keywords": "manipulation, poor planning, untapped talents"
      },
      "card_position": 1,
      "deleted_at": null
    },
    {
      "card_id": "b2fe3bab-b570-47d8-825b-d1593cf0d1f3",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "II - The High Priestess",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Moon",
        "upright_meaning": "The High Priestess represents the subconscious mind, mystery, and inner wisdom. Seated between the pillars of duality, she guards the veil to hidden knowledge. This card encourages you to trust your intuition, listen to your dreams, and explore the depths of your psyche. Things are not always as they seem—look beyond the surface.",
        "reversed_meaning": "When reversed, The High Priestess signals a disconnect from your inner voice. You may be ignoring your gut feelings, keeping secrets, or feeling lost and confused. It can also indicate surface-level thinking or an inability to access deeper truths.",
        "upright_keywords": "intuition, sacred knowledge, divine feminine",
        "reversed_keywords": "secrets, disconnected from intuition, withdrawal"
      },
      "card_position": 2,
      "deleted_at": null
    },
    {
      "card_id": "3db5c774-1556-4d3d-84ec-fad68a29d73b",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "III - The Empress",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Earth / Venus",
        "upright_meaning": "The Empress embodies unconditional love, fertility, and abundance. She is the mother figure who nurtures all living things and encourages creativity and growth. This card represents a time of plenty, whether in relationships, creative projects, or personal well-being. It invites you to connect with nature and embrace your sensual side.",
        "reversed_meaning": "Reversed, The Empress suggests challenges with nurturing—either giving too much or not receiving enough. You may feel creatively stagnant, overly dependent on others, or neglectful of self-care. It can also indicate difficulties in pregnancy or family matters.",
        "upright_keywords": "femininity, beauty, nature, nurturing",
        "reversed_keywords": "creative block, dependence on others"
      },
      "card_position": 3,
      "deleted_at": null
    },
    {
      "card_id": "627371a4-3303-48db-a6b8-ad6addfe56e6",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "IV - The Emperor",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Fire / Mars",
        "upright_meaning": "The Emperor represents stability, leadership, and the establishment of order. He is the archetypal father figure who sets rules and builds foundations. This card calls you to take charge of your life, create structure, and use logic and discipline to achieve your ambitions. It's about asserting your power and protecting your realm.",
        "reversed_meaning": "Reversed, The Emperor warns of tyranny or rigidity. You may be abusing power, micromanaging, or struggling with a lack of authority in your life. It can also indicate issues with a domineering father figure or an inability to set boundaries.",
        "upright_keywords": "authority, structure, control, fatherhood",
        "reversed_keywords": "domination, excessive control, lack of discipline"
      },
      "card_position": 4,
      "deleted_at": null
    },
    {
      "card_id": "75a94823-b401-4172-91a9-270feebc29ef",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "V - The Hierophant",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Earth / Venus",
        "upright_meaning": "The Hierophant represents established institutions, religious or spiritual beliefs, and conventional wisdom. He is the bridge between heaven and earth, guiding others through teachings and rituals. This card suggests a time to follow tradition, seek counsel from mentors, or commit to a group or belief system.",
        "reversed_meaning": "Reversed, The Hierophant indicates a break from convention. You may be questioning authority, rejecting dogma, or forging your own spiritual path. It can also signal nonconformity, unconventional beliefs, or challenges with established institutions.",
        "upright_keywords": "tradition, conformity, morality, ethics",
        "reversed_keywords": "rebellion, subversiveness, new approaches"
      },
      "card_position": 5,
      "deleted_at": null
    },
    {
      "card_id": "22d2e475-3309-4a97-8a90-726d3145dcd4",
      "card_suit": "Major Arcana",
      "image_url": "",
      "is_deleted": false,
      "card_name": "VI - The Lovers",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Air / Mercury",
        "upright_meaning": "The Lovers card represents deep connections, choices, and alignment of values. It often signifies a romantic relationship or a pivotal decision about partnerships. This card encourages you to follow your heart and make choices that reflect your true self. It's about unity and the integration of opposites.",
        "reversed_meaning": "When reversed, The Lovers suggests inner conflict or relationship issues. You may be facing a difficult choice, experiencing disharmony, or struggling with self-love. It can also indicate a misalignment of values or a need to focus on self before committing to others.",
        "upright_keywords": "love, harmony, relationships, values alignment",
        "reversed_keywords": "self-love, disharmony, imbalance"
      },
      "card_position": 6,
      "deleted_at": null
    },
    {
      "card_id": "ada336c2-5624-46f8-9ed9-5ff266b4e6f6",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Two of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Venus in Cancer",
        "upright_meaning": "The Two of Cups depicts a man and woman exchanging cups, with the caduceus symbol above them—representing balance, harmony, and the merging of energies. This card signifies a deep connection, whether romantic partnership, friendship, or reconciliation. It's about equality, respect, and the beauty of coming together.",
        "reversed_meaning": "Reversed, the Two of Cups warns of disharmony in relationships. You may be experiencing a breakup, miscommunication, or one-sided affection. It can also indicate a need to rebalance the give-and-take in a partnership.",
        "upright_keywords": "partnership, connection, mutual attraction",
        "reversed_keywords": "imbalance, separation, misunderstanding"
      },
      "card_position": 2,
      "deleted_at": null
    },
    {
      "card_id": "0e51e1f6-1aae-45d3-939c-072aae14c002",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Three of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Mercury in Cancer",
        "upright_meaning": "The Three of Cups shows three women dancing in a circle, cups raised high in joy. This card celebrates friendship, sisterhood, and communal gatherings. It's a time for social connection, parties, and rejoicing with loved ones. Let loose, have fun, and appreciate your support network.",
        "reversed_meaning": "Reversed, the Three of Cups suggests overindulgence or social drama. You may be dealing with gossip, feeling left out, or partying too hard. It can also indicate a need to withdraw from social circles and focus on yourself.",
        "upright_keywords": "celebration, friendship, community",
        "reversed_keywords": "gossip, scandal, isolation"
      },
      "card_position": 3,
      "deleted_at": null
    },
    {
      "card_id": "812272d9-9c49-4196-a505-b13eaf029ddb",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Four of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Moon in Cancer",
        "upright_meaning": "The Four of Cups portrays a young man sitting under a tree, arms crossed, ignoring three cups before him while a fourth is offered by a hand from above. He's dissatisfied, bored, and blind to new opportunities. This card signals a time of withdrawal, reevaluation, and emotional stagnation. Look up—something new is being offered.",
        "reversed_meaning": "Reversed, the Four of Cups indicates a shift from apathy to awareness. You're finally opening your eyes to new possibilities or ready to re-engage with life. It can also mean you've been too inward-focused and need to take action.",
        "upright_keywords": "apathy, contemplation, missed opportunities",
        "reversed_keywords": "new perspectives, awakening, turning inward"
      },
      "card_position": 4,
      "deleted_at": null
    },
    {
      "card_id": "7c5c4736-0e4e-4e84-a497-f28dbc7be2e1",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Five of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Mars in Scorpio",
        "upright_meaning": "The Five of Cups shows a figure in black, head bowed, mourning three spilled cups while two remain standing behind them. This card represents sorrow, regret, and focusing on what's lost rather than what remains. It's okay to grieve, but don't forget the blessings still present.",
        "reversed_meaning": "Reversed, the Five of Cups signals the beginning of healing. You're starting to accept loss, forgive yourself or others, and see what remains. The pain is still there, but you're ready to move forward.",
        "upright_keywords": "loss, grief, disappointment",
        "reversed_keywords": "acceptance, moving on, forgiveness"
      },
      "card_position": 5,
      "deleted_at": null
    },
    {
      "card_id": "d9da3ef2-9937-401f-82db-926bec872ac3",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Six of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Sun in Scorpio",
        "upright_meaning": "The Six of Cups depicts a young girl offering a cup to a boy, surrounded by blooming flowers—a scene of innocence and fond memories. This card evokes nostalgia, past connections, and childlike wonder. You may reconnect with someone from your past, revisit old haunts, or simply need to embrace simpler joys.",
        "reversed_meaning": "Reversed, the Six of Cups suggests being stuck in the past or clinging to memories. You may need to let go of childhood patterns, forgive old wounds, or stop idealizing what was. It's time to grow up and move forward.",
        "upright_keywords": "nostalgia, childhood memories, reunion",
        "reversed_keywords": "living in the past, moving forward, leaving home"
      },
      "card_position": 6,
      "deleted_at": null
    },
    {
      "card_id": "ec13dcb7-84b5-4431-9bb8-28a21ff1e442",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Seven of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Venus in Scorpio",
        "upright_meaning": "The Seven of Cups shows a silhouette facing seven cups floating on clouds, each containing a mysterious symbol—a face, a serpent, a castle, treasure. This card represents dreams, fantasies, and the many choices before you. But not all that glitters is gold. You may be tempted by illusions or overwhelmed by possibilities.",
        "reversed_meaning": "Reversed, the Seven of Cups signals a moment of clarity. The fog lifts, and you can see things as they truly are. You're ready to make a decision, cut through the fantasy, and focus on what's real.",
        "upright_keywords": "illusions, choices, wishful thinking",
        "reversed_keywords": "clarity, focus, making a decision"
      },
      "card_position": 7,
      "deleted_at": null
    },
    {
      "card_id": "dab5baaa-a210-4613-85e5-e2e7585bca5a",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Eight of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Saturn in Pisces",
        "upright_meaning": "The Eight of Cups depicts a figure walking away from a stack of eight cups, heading toward mountains under a red moon. This card represents the courage to leave behind what no longer serves you—even if it's comfortable—in search of deeper meaning. You're emotionally ready to move on.",
        "reversed_meaning": "Reversed, the Eight of Cups suggests fear of leaving or being stuck in a situation you've outgrown. You may be avoiding necessary change or staying out of habit. It's time to examine why you're afraid to move on.",
        "upright_keywords": "walking away, leaving behind, seeking truth",
        "reversed_keywords": "stagnation, fear of change, avoidance"
      },
      "card_position": 8,
      "deleted_at": null
    },
    {
      "card_id": "b3c3524c-6326-40c4-8e08-335e6ffec7a3",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Nine of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Jupiter in Pisces",
        "upright_meaning": "The Nine of Cups is often called the wish card. A smug figure sits with arms crossed before nine cups arranged on a shelf. This card represents emotional fulfillment, satisfaction, and getting what you want. Your wishes are coming true—take a moment to appreciate it.",
        "reversed_meaning": "Reversed, the Nine of Cups warns of never being satisfied. You may have achieved your goals but still feel empty, or you're overindulging without appreciating what you have. True contentment comes from within.",
        "upright_keywords": "contentment, wishes fulfilled, satisfaction",
        "reversed_keywords": "greed, dissatisfaction, overindulgence"
      },
      "card_position": 9,
      "deleted_at": null
    },
    {
      "card_id": "a4694b69-6fe0-4f6e-ac33-3c2643821577",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Ten of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Mars in Pisces",
        "upright_meaning": "The Ten of Cups shows a happy family raising their arms to a rainbow of ten cups—the ultimate symbol of emotional bliss. This card represents domestic harmony, lasting happiness, and the realization of dreams. Your emotional needs are met, and you're surrounded by love and support.",
        "reversed_meaning": "Reversed, the Ten of Cups suggests discord in relationships or family. You may be experiencing conflict, feeling disconnected from loved ones, or struggling to find happiness despite outward success. Focus on healing emotional bonds.",
        "upright_keywords": "happiness, emotional fulfillment, family",
        "reversed_keywords": "broken home, unhappiness, separation"
      },
      "card_position": 10,
      "deleted_at": null
    },
    {
      "card_id": "893e7800-2ba3-48ba-a309-b01e074b3352",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Page of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Cancer",
        "upright_meaning": "The Page of Cups is a young dreamer holding a cup from which a fish peers out—representing imagination and intuition. This card invites you to approach life with curiosity, explore your creative side, and listen to your inner voice. A message or opportunity may be coming your way.",
        "reversed_meaning": "Reversed, the Page of Cups suggests emotional immaturity or blocking creativity. You may be afraid to express feelings, ignoring intuitive nudges, or acting childishly. Embrace your inner artist and let emotions flow.",
        "upright_keywords": "curiosity, creativity, intuition",
        "reversed_keywords": "immaturity, creative block, fear of emotions"
      },
      "card_position": 11,
      "deleted_at": null
    },
    {
      "card_id": "0578c962-0b13-4cac-a57e-b27e2f43e162",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Knight of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Scorpio",
        "upright_meaning": "The Knight of Cups rides slowly on a white horse, holding a cup as if offering it to someone. He represents the romantic idealist—charming, artistic, and driven by emotion. This card signals a romantic proposal, a creative pursuit, or following your heart's desire.",
        "reversed_meaning": "Reversed, the Knight of Cups warns of emotional manipulation or unreliability. You may be dealing with a moody person, feeling jealous, or experiencing unrealistic romantic expectations. Stay grounded.",
        "upright_keywords": "romance, charm, following the heart",
        "reversed_keywords": "moodiness, manipulation, jealousy"
      },
      "card_position": 12,
      "deleted_at": null
    },
    {
      "card_id": "1166bf5a-0f30-4011-ba5f-2d5f6e2be8d7",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Queen of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Cancer",
        "upright_meaning": "The Queen of Cups sits on her throne by the sea, holding a beautifully decorated cup. She is deeply intuitive, compassionate, and emotionally balanced. This card represents a nurturing presence—either yourself or someone in your life—who offers unconditional emotional support and wisdom.",
        "reversed_meaning": "Reversed, the Queen of Cups suggests emotional neediness or being overwhelmed by feelings. You may be giving too much, losing yourself in others' emotions, or feeling insecure. Reclaim your emotional boundaries.",
        "upright_keywords": "compassion, emotional security, intuition",
        "reversed_keywords": "insecurity, codependence, emotional neediness"
      },
      "card_position": 13,
      "deleted_at": null
    },
    {
      "card_id": "23eb95bc-a394-4c14-b733-a50195aa27c5",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "King of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Scorpio",
        "upright_meaning": "The King of Cups sits on a throne amid stormy seas, yet remains calm and composed. He masters his emotions rather than being ruled by them. This card represents emotional maturity, compassion with boundaries, and the ability to navigate turbulent feelings with grace.",
        "reversed_meaning": "Reversed, the King of Cups suggests emotional repression or manipulation. You may be bottling up feelings, appearing cold to protect yourself, or swinging between moods. True strength comes from acknowledging and processing emotions.",
        "upright_keywords": "emotional balance, compassion, control",
        "reversed_keywords": "repressed emotions, coldness, mood swings"
      },
      "card_position": 14,
      "deleted_at": null
    },
    {
      "card_id": "7ab4f70e-3e73-4bbc-864b-d1c6acd0488e",
      "card_suit": "Cup",
      "image_url": "",
      "is_deleted": false,
      "card_name": "Ace of Cups",
      "deck_id": "b67bee3c-e4b1-4c7b-81cd-3580fcf54c89",
      "card_metadata": {
        "element_zodiac": "Water / Cancer",
        "upright_meaning": "The Ace of Cups overflows with pure emotional potential. A hand emerges from a cloud offering a golden cup, from which five streams of water flow—representing the gifts of love, joy, and spiritual abundance. This card signals the start of a new relationship, a deepening of emotional connection, or a surge of creative inspiration. It invites you to open your heart and receive.",
        "reversed_meaning": "Reversed, the Ace of Cups suggests emotional blockages or a closed heart. You may be withholding love, feeling empty, or unable to receive what's being offered. It can also indicate a creative drought or fear of vulnerability. Let down your walls.",
        "upright_keywords": "new feelings, emotional beginnings, love",
        "reversed_keywords": "blocked emotions, emptiness, creative block"
      },
      "card_position": 1,
      "deleted_at": null
    }
  ]
  // ====================================================

  const cardsBySuit = useMemo(() => {
  const groups = {};

  // 1. Group cards by suit
  cards.forEach(card => {
    const suit = card.card_suit || 'Unknown';
    if (!groups[suit]) groups[suit] = [];
    groups[suit].push(card);
  });

  // 2. Sort cards WITHIN each suit by position (0, 1, 2...)
  Object.keys(groups).forEach(suit => {
    groups[suit].sort((a, b) => (a.card_position ?? 0) - (b.card_position ?? 0));
  });

  // 3. Define the order the SUITS themselves appear on the screen
  const suitOrder = ['Major Arcana', 'Cup', 'Wand', 'Sword', 'Pentacle', 'Unknown'];
  const sortedGroups = {};

  // Apply the suit order
  suitOrder.forEach(suit => {
    if (groups[suit]) sortedGroups[suit] = groups[suit];
  });

  // Pick up any suits that weren't in our predefined list
  Object.keys(groups).forEach(suit => {
    if (!sortedGroups[suit]) sortedGroups[suit] = groups[suit];
  });

  return sortedGroups;
}, [cards]);

  const handleCardHover = (card, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      card,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleCardLeave = () => {
    setTooltip({ visible: false, card: null, x: 0, y: 0 });
  };

  if (!deck) return <div className="p-8 text-white">Loading Deck...</div>;

  return (
   <div className="relative h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-950 via-purple-950/20 to-indigo-950/30 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8 h-full p-6 lg:p-8 relative z-10 overflow-hidden">
        
        {/* LEFT SIDE: SCROLLABLE CONTAINER */}
        <div className={`
          transition-all duration-500
          ${selectedCard ? 'lg:w-36 w-full' : 'w-full'}
          h-full overflow-y-auto custom-scrollbar
          ${selectedCard ? 'overflow-x-hidden' : ''}
        `}>
          {!selectedCard ? (
            // Full view: header + suit groups scroll together
            <div className="pr-2">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight bg-gradient-to-r from-purple-200 to-indigo-300 bg-clip-text text-transparent">
                  {deck.deck_name}
                </h1>
                <p className="text-purple-300 text-sm uppercase tracking-[0.3em] mt-2">
                  {deck.deck_type}
                </p>
                <div className="w-20 h-[2px] bg-gradient-to-r from-purple-500 to-transparent mt-4" />
              </div>

              <div className="space-y-8">
                {Object.entries(cardsBySuit).map(([suit, suitCards]) => (
                  <div key={suit}>
                    <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-3 pl-1 border-l-3 border-purple-500">
                      {suit}s
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                      {suitCards.map((card) => (
                        <CardThumbnail
                          key={card.card_id}
                          card={card}
                          onClick={() => setSelectedCard(card)}
                          onMouseEnter={(e) => handleCardHover(card, e)}
                          onMouseLeave={handleCardLeave}
                          isSelected={false}
                          selectedMode={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Compact vertical strip mode when a card is selected
            // Use flex-col with items-center to center cards, and prevent overflow
            <div className="flex flex-row lg:flex-col gap-5 items-center pr-1">
              {cards.map((card) => (
                <CardThumbnail
                  key={card.card_id}
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  onMouseEnter={(e) => handleCardHover(card, e)}
                  onMouseLeave={handleCardLeave}
                  isSelected={selectedCard?.card_id === card.card_id}
                  selectedMode={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: DETAIL PANEL */}
        <AnimatePresence mode="wait">
          {selectedCard && (
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="flex-1 bg-black/40 backdrop-blur-2xl border border-purple-500/20 rounded-2xl 
                         overflow-y-auto relative shadow-2xl custom-scrollbar"
            >
              <button 
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-purple-900/30 
                           hover:bg-red-500/30 hover:text-red-300 transition-all backdrop-blur-sm
                           border border-white/10"
              >
                <X size={18} />
              </button>

              <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex justify-center md:w-2/5">
                    <motion.div 
                      layoutId={`card-${selectedCard.card_id}`}
                      className="w-full max-w-[280px] aspect-[2/3] rounded-xl 
                                 bg-gradient-to-br from-indigo-900/40 to-purple-900/40
                                 border-2 border-purple-400/40 shadow-2xl
                                 flex flex-col items-center justify-center
                                 backdrop-blur-sm overflow-hidden"
                    >
                      {selectedCard.image_url ? (
                        <img 
                          src={selectedCard.image_url} 
                          alt={selectedCard.card_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <>
                          <Sparkles size={48} className="text-purple-300/40" />
                          <span className="text-purple-300/60 text-sm font-mono mt-2">✦ {selectedCard.card_suit} ✦</span>
                        </>
                      )}
                    </motion.div>
                  </div>

                  <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {selectedCard.card_name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs font-medium border border-purple-500/30">
                          {selectedCard.card_suit}
                        </span>
                        <span className="px-3 py-1 bg-indigo-600/30 text-indigo-200 rounded-full text-xs font-medium border border-indigo-500/30">
                          {selectedCard.card_metadata?.element_zodiac || 'Mystical'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="text-xs text-green-300 bg-green-900/30 px-3 py-1 rounded-full">
                        🔮 Upright: {selectedCard.card_metadata?.upright_keywords}
                      </span>
                      <span className="text-xs text-rose-300 bg-rose-900/30 px-3 py-1 rounded-full">
                        🌙 Reversed: {selectedCard.card_metadata?.reversed_keywords}
                      </span>
                    </div>

                    <div className="space-y-5 pb-4">
                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                          Upright Meaning
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          {selectedCard.card_metadata?.upright_meaning}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                        <h3 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-rose-400 rounded-full" />
                          Reversed Meaning
                        </h3>
                        <p className="text-gray-400 leading-relaxed text-sm italic">
                          {selectedCard.card_metadata?.reversed_meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip Portal */}
      {tooltip.visible && tooltip.card && !selectedCard && createPortal(
        <div
          className="fixed z-[9999] px-3 py-2 bg-gray-900/95 backdrop-blur-md rounded-lg border border-purple-500/30 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px',
          }}
        >
          <div className="space-y-1 text-xs whitespace-nowrap">
            <p className="text-emerald-300 font-semibold">
              🔮 Upright: <span className="text-gray-200 font-normal">{tooltip.card.card_metadata?.upright_keywords || '—'}</span>
            </p>
            <p className="text-rose-300 font-semibold">
              🌙 Reversed: <span className="text-gray-300 font-normal">{tooltip.card.card_metadata?.reversed_keywords || '—'}</span>
            </p>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-r border-b border-purple-500/30" />
        </div>,
        document.body
      )}

      <style jsx global>{`
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(128, 90, 213, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
        
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
};

const CardThumbnail = ({ card, onClick, onMouseEnter, onMouseLeave, isSelected, selectedMode }) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative cursor-pointer rounded-xl transition-all duration-300 flex-shrink-0
        backdrop-blur-sm border-2 overflow-hidden
        ${isSelected 
          ? 'border-purple-400 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)] bg-purple-900/30 z-10' 
          : 'border-purple-800/40 hover:border-purple-500/70 bg-black/30 hover:bg-purple-900/20'
        }
        ${selectedMode ? 'w-20 h-28 lg:w-28 lg:h-40' : 'aspect-[2/3] w-full'}
        group
      `}
      style={{ transformOrigin: 'center center' }}
    >
      {card.image_url ? (
        <img 
          src={card.image_url} 
          alt={card.card_name}
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
        />
      ) : (
        <>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition">
            <Sparkles size={selectedMode ? 24 : 32} className="text-purple-300" />
          </div>
        </>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
      
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-[10px] lg:text-xs font-medium text-purple-200/90 tracking-wide drop-shadow-md">
          {card.card_name}
        </span>
      </div>
    </motion.div>
  );
};

export default DeckExplorer;