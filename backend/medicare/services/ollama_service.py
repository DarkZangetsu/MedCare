"""
Service pour l'intégration avec l'API Ollama pour le triage médical par IA
"""
import requests
import json
from typing import Dict, Optional
from django.conf import settings

# Clé API Ollama
OLLAMA_API_KEY = "9461e12c2edd4b51b21f1406f89a167c.N0PkBrfSB6W3nVWe2b0O1b_z"
OLLAMA_API_URL = "https://ollama.com/api/generate"  # Endpoint pour l'API cloud Ollama


def analyze_symptoms_with_ollama(symptoms: str) -> Dict[str, str]:
    """
    Analyse les symptômes avec Ollama et retourne une évaluation structurée.
    
    Args:
        symptoms: Description des symptômes du patient
        
    Returns:
        Dict contenant severity, advice, et recommendation
    """
    try:
        # Prompt structuré pour obtenir une réponse formatée
        prompt = f"""Tu es un assistant médical expert en triage. Analyse les symptômes suivants et fournis une évaluation médicale professionnelle.

Symptômes décrits: {symptoms}

Fournis une réponse au format JSON avec les champs suivants:
- "severity": un des valeurs suivantes: "low", "medium", "high", "critical"
- "advice": conseils médicaux détaillés en français (2-3 phrases)
- "recommendation": recommandation spécifique sur quand consulter (1 phrase)

Critères de gravité:
- "critical": urgences vitales (douleur thoracique, difficulté respiratoire sévère, perte de conscience, etc.)
- "high": symptômes préoccupants nécessitant consultation rapide (fièvre élevée persistante, vomissements répétés, saignements, etc.)
- "medium": symptômes modérés à surveiller (maux de tête persistants, fatigue importante, nausées, etc.)
- "low": symptômes légers (fatigue légère, maux de tête passagers, etc.)

Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire."""

        headers = {
            "Authorization": f"Bearer {OLLAMA_API_KEY}",
            "Content-Type": "application/json"
        }

        # Format pour l'API Ollama /api/generate
        full_prompt = f"""Tu es un assistant médical expert. Tu fournis des évaluations de triage médical en français, toujours au format JSON strict.

{prompt}"""

        payload = {
            "model": "llama3.2",  # Modèle par défaut, peut être ajusté
            "prompt": full_prompt,
            "stream": False,  # Pas de streaming pour une réponse complète
            "options": {
                "temperature": 0.3,  # Température plus basse pour des réponses plus cohérentes
                "num_predict": 500  # Nombre maximum de tokens à générer
            }
        }

        response = requests.post(
            OLLAMA_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            # L'API Ollama /api/generate retourne directement le texte dans "response"
            content = data.get("response", "")
            
            if not content:
                raise ValueError("Réponse vide de l'API Ollama")
            
            # Extraire le JSON de la réponse
            try:
                # Essayer de parser directement
                result = json.loads(content)
            except json.JSONDecodeError:
                # Si la réponse contient du texte avant/après le JSON, essayer de l'extraire
                import re
                # Chercher un objet JSON dans la réponse
                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError("Impossible d'extraire le JSON de la réponse")
            
            # Valider et normaliser la réponse
            severity = result.get("severity", "medium").lower()
            if severity not in ["low", "medium", "high", "critical"]:
                severity = "medium"
            
            return {
                "severity": severity,
                "advice": result.get("advice", "Surveillez vos symptômes et consultez un médecin si nécessaire."),
                "recommendation": result.get("recommendation", "Surveillance recommandée.")
            }
        else:
            # En cas d'erreur API, utiliser une logique de fallback
            print(f"Erreur API Ollama: {response.status_code} - {response.text}")
            return _fallback_analysis(symptoms)
            
    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion à Ollama: {str(e)}")
        return _fallback_analysis(symptoms)
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        print(f"Erreur de parsing de la réponse Ollama: {str(e)}")
        return _fallback_analysis(symptoms)
    except Exception as e:
        print(f"Erreur inattendue avec Ollama: {str(e)}")
        return _fallback_analysis(symptoms)


def _fallback_analysis(symptoms: str) -> Dict[str, str]:
    """
    Analyse de fallback basée sur des mots-clés si Ollama n'est pas disponible.
    """
    symptoms_lower = symptoms.lower()
    
    # Déterminer la gravité
    critical_keywords = ['douleur poitrine', 'difficulté respirer', 'perte connaissance', 'douleur thoracique', 'essoufflement sévère']
    high_keywords = ['fièvre élevée', 'vomissements', 'saignement', 'fièvre persistante', 'vomissements répétés']
    medium_keywords = ['maux tête', 'fatigue', 'nausée', 'maux de tête', 'fatigue importante']
    
    if any(keyword in symptoms_lower for keyword in critical_keywords):
        severity = 'critical'
        advice = "URGENCE MÉDICALE - Consultez immédiatement un médecin ou appelez les urgences."
        recommendation = "Consultation d'urgence requise immédiatement."
    elif any(keyword in symptoms_lower for keyword in high_keywords):
        severity = 'high'
        advice = "Consultez un médecin dans les prochaines heures. Surveillez vos symptômes attentivement."
        recommendation = "Consultation recommandée dans les 2-4 heures."
    elif any(keyword in symptoms_lower for keyword in medium_keywords):
        severity = 'medium'
        advice = "Surveillez vos symptômes. Reposez-vous et hydratez-vous bien. Si les symptômes persistent, consultez un médecin."
        recommendation = "Consultation recommandée dans les 24-48h si les symptômes persistent."
    else:
        severity = 'low'
        advice = "Vos symptômes semblent légers. Reposez-vous, hydratez-vous et surveillez l'évolution."
        recommendation = "Surveillance à domicile recommandée. Consultez si aggravation."
    
    return {
        "severity": severity,
        "advice": advice,
        "recommendation": recommendation
    }

