<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250412064911 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cadeau ADD reservation_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE cadeau ADD CONSTRAINT FK_3D213460B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservation (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3D213460B83297E7 ON cadeau (reservation_id)');
        $this->addSql('ALTER TABLE reservation DROP CONSTRAINT fk_42c84955d9d5ed84');
        $this->addSql('DROP INDEX uniq_42c84955d9d5ed84');
        $this->addSql('ALTER TABLE reservation DROP cadeau_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE reservation ADD cadeau_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE reservation ADD CONSTRAINT fk_42c84955d9d5ed84 FOREIGN KEY (cadeau_id) REFERENCES cadeau (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE UNIQUE INDEX uniq_42c84955d9d5ed84 ON reservation (cadeau_id)');
        $this->addSql('ALTER TABLE cadeau DROP CONSTRAINT FK_3D213460B83297E7');
        $this->addSql('DROP INDEX UNIQ_3D213460B83297E7');
        $this->addSql('ALTER TABLE cadeau DROP reservation_id');
    }
}
