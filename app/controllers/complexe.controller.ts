

import { RatingStadium } from '../models/index.model';
import { IUser } from 'app/models/user.model';
import axios from 'axios';
import { Request, Response } from 'express';

export const listUpdate = async (req: Request, res: Response) => {
    //Liste des complexes sportifs
    const {clusterPrecision, boundsPrecision, type} = req.query;
    try {
        let link= null
        if (type === "city") {
            link = `https://equipements.sports.gouv.fr/api/records/1.0/geocluster/?refine.inst_part_type_filter=Complexe+sportif&refine.equip_aps_nom=Football+%2F+Football+en+salle+(Futsal)&refine.equip_type_name=Multisports%2FCity-stades&static=false&datasetcard=false&scrollWheelZoom=false&basemap=c26ae9&location=2,0,-0.17578&clusterdistance=50&clusterprecision=${clusterPrecision}&geofilter.bbox=${boundsPrecision}&return_polygons=true&dataset=data-es&timezone=Europe%2FParis&lang=fr`
        } else {
            link = `https://equipements.sports.gouv.fr/api/records/1.0/geocluster/?refine.inst_part_type_filter=Complexe+sportif&refine.equip_aps_nom=Football+%2F+Football+en+salle+(Futsal)&refine.equip_type_name=Terrain+de+football&static=false&datasetcard=false&scrollWheelZoom=false&basemap=c26ae9&location=2,0,-0.17578&clusterdistance=50&clusterprecision=${clusterPrecision}&geofilter.bbox=${boundsPrecision}&return_polygons=true&dataset=data-es&timezone=Europe%2FParis&lang=fr`
        }

        await axios.get(link)
        .then((response) => {
            return res.status(200).send({ response: response.data });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).send({ message: error.message });
        });
    } catch (error:any) {
        return res.status(500).send({ message: error.message });
    }
}

export const detailComplexe = async (req: Request, res: Response) => {
    const {position, type} = req.query;    
    try {
        let link = null
        if(type === "city") {
            link = `https://equipements.sports.gouv.fr/api/records/1.0/download/?refine.inst_part_type_filter=Complexe+sportif&refine.equip_aps_nom=Football+%2F+Football+en+salle+(Futsal)&refine.equip_type_name=Multisports%2FCity-stades&static=false&datasetcard=false&scrollWheelZoom=false&basemap=c26ae9&location=2,0,-0.17578&format=json&rows=100&geofilter.distance=${position}&dataset=data-es&timezone=Europe%2FParis&lang=fr`
        } else {
            link = `https://equipements.sports.gouv.fr/api/records/1.0/download/?refine.inst_part_type_filter=Complexe+sportif&refine.equip_aps_nom=Football+%2F+Football+en+salle+(Futsal)&refine.equip_type_name=Terrain+de+football&static=false&datasetcard=false&scrollWheelZoom=false&basemap=c26ae9&location=2,0,-0.17578&format=json&rows=100&geofilter.distance=${position}&dataset=data-es&timezone=Europe%2FParis&lang=fr`
        }
        await axios.get(link)
        .then((response) => {
            return res.status(200).send({ response: response.data });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).send({ message: error.message });
        });
    } catch (error:any) {
        return res.status(500).send({ message: error.message });
    }
}

// ajouter un note à un complexe sportif (1 note par utilisateur) si la note existe déjà, elle est mise à jour
export const addRating = async (req: Request & {user?:any}, res: Response) => {
    const {recordid, rating, comment} = req.body;
    const userId = req.user._id;
    console.log(comment);
    try {
        //upsert mongoose
        await RatingStadium.findOneAndUpdate({userId: userId, recordid: recordid}, {userId: userId, recordid: recordid, rating: Number(rating), comment:comment}, {upsert: true, new: true})
        .then((response) => {
            return res.status(200).send({ message: "Note ajoutée avec succès" });
        })
        .catch((error) => {
            console.log(error);
            throw new Error(error);
        });
    } catch (error:any) {
        return res.status(500).send({ message: error.message });
    }
}

// récupérer la note moyenne d'un complexe sportif
export const rating = async (req: Request & { user?: any; cookiesToSet?: { access_token: { value: string; options: any }; refresh_token: { value: string; options: any } }; additionalData?: any }, res: Response) => {
    const { cookiesToSet, additionalData } = req;
    const {recordid} = req.query;

    try {
        // Vérifier si l'utilisateur est authentifié
        if (req.user) {
            console.log('User is authenticated:', String(req.user._id));
        } else {
            console.log('User is not authenticated');
        }

        // Set cookies if available
        if (cookiesToSet) {
            const { access_token, refresh_token } = cookiesToSet;
            res.cookie('access_token', access_token.value, access_token.options);
            res.cookie('refresh_token', refresh_token.value, refresh_token.options);
            console.log('refresh_token.value:', refresh_token.value);
        }

        // Utiliser des données supplémentaires si disponibles
        if (additionalData) {
            console.log('Additional data:', additionalData);
        }

        // Récupérer tous les avis pour le recordid donné
        const ratingStadium = await RatingStadium.find({ recordid: recordid }).populate('userId', 'username lastname');

        let sum = 0;
        let comments: any[] = [];

        // Parcourir chaque avis
        for (const element of ratingStadium) {
            sum += element.rating;

            // Ajouter le commentaire avec le nom et le prénom de l'utilisateur au tableau des commentaires
            comments && comments.push({
                comment: element.comment,
                user: element.userId,
                rating: element.rating,
                date: element.updatedAt,
                current: (req.user && req.user._id && element.userId && element.userId._id) ? String(element.userId._id) === String(req.user._id) : false
            });
        }

        // Calculer la note moyenne
        const average = sum / ratingStadium.length;

        // Retourner la réponse avec la note moyenne, les commentaires et l'avis de l'utilisateur
        return res.status(200).send({ rating: average, comments: comments, additionalData: additionalData});
    } catch (error: any) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
}



